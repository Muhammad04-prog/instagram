"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { type ApiError } from "@/lib/axios";
import { EXPLORE_PAGE_SIZE, FEED_PAGE_SIZE, PAGE_SIZE, REELS_PAGE_SIZE } from "@/lib/constants";
import { queryKeys } from "@/lib/query-keys";
import { followService } from "@/services/followingRelationShip.service";
import { postService } from "@/services/post.service";
import type { AddPostDto, Post } from "@/types/post.types";

/**
 * `/` — the feed.
 *
 * ⚠️ `get-following-post` is unusable: it ignores PageNumber/PageSize (always
 * returns the whole feed) and, once the follow list is large enough, the
 * backend's own processing time (~26s) trips its request timeout and it 400s
 * (docs/BACKEND_BUGS.md #21). `get-posts`, by contrast, paginates correctly and
 * is fast per author. So the feed is built here instead of calling the broken
 * endpoint: fetch who I follow, fetch each of their recent posts (in parallel,
 * one author's failure doesn't sink the rest), merge and sort by date.
 */
export function useFeed() {
  const { user } = useAuth();
  const userId = user?.userId;

  return useQuery({
    queryKey: queryKeys.posts.feed({ userId }),
    queryFn: async () => {
      const subscriptions = await followService.getSubscriptions(userId!);
      const authorIds = [...new Set(subscriptions.map((sub) => sub.userShortInfo.userId))];

      const authorPosts = await Promise.all(
        authorIds.map((authorId) =>
          postService
            .getPosts({ userId: authorId, pageNumber: 1, pageSize: FEED_PAGE_SIZE })
            .catch(() => [] as Post[]),
        ),
      );

      return authorPosts
        .flat()
        .sort((a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime());
    },
    enabled: Boolean(userId),
  });
}

export function useUserPosts(userId: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.byUser(userId),
    queryFn: ({ pageParam }) =>
      postService.getPosts({ userId, pageNumber: pageParam, pageSize: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length + 1,
    enabled: enabled && Boolean(userId),
  });
}

/**
 * My own posts. `get-my-posts` answers with a **bare array** (no envelope, no
 * paging), so this is a plain query — the profile grid's Panel only needs
 * `{ isPending, isError, refetch }`, which a useQuery satisfies just as well.
 */
export function useMyPosts(enabled = true) {
  return useQuery({
    queryKey: queryKeys.posts.mine(),
    queryFn: () => postService.getMyPosts(),
    enabled,
  });
}

/**
 * /reels. The API hands back `images` as a single file name here (not an array),
 * so each reel is normalised into a Post — that way the Phase-5 like / save /
 * comment hooks work on it unchanged.
 *
 * ⚠️ Like `get-following-post` (docs/BACKEND_BUGS.md #21), `get-reels` can hand
 * back reels that already appeared on an earlier page (confirmed live: postId
 * 84 and 79 repeated across pages, React logging duplicate-key warnings). We
 * stop asking for more pages once a page adds nothing new, and dedupe by
 * `postId` before rendering so a repeat never shows up twice.
 */
export function useReels() {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.reels(),
    queryFn: ({ pageParam }) =>
      postService.getReels({ pageNumber: pageParam, pageSize: REELS_PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < REELS_PAGE_SIZE) return undefined;
      const seenIds = new Set(allPages.slice(0, -1).flatMap((page) => page.map((r) => r.postId)));
      const hasNewReel = lastPage.some((reel) => !seenIds.has(reel.postId));
      return hasNewReel ? allPages.length + 1 : undefined;
    },
    select: (data) => {
      const seenIds = new Set<number>();
      return {
        ...data,
        pages: data.pages.map((page) =>
          page
            .filter((reel) => {
              if (seenIds.has(reel.postId)) return false;
              seenIds.add(reel.postId);
              return true;
            })
            .map((reel): Post => ({ ...reel, images: [reel.images] })),
        ),
      };
    },
  });
}

/** /explore — every post, newest first (docs/screenshots/img23). */
export function useExplorePosts() {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.list({ pageSize: EXPLORE_PAGE_SIZE }),
    queryFn: ({ pageParam }) =>
      postService.getPosts({ pageNumber: pageParam, pageSize: EXPLORE_PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < EXPLORE_PAGE_SIZE ? undefined : allPages.length + 1,
  });
}

export function usePost(postId: number) {
  return useQuery({
    queryKey: queryKeys.posts.detail(postId),
    queryFn: () => postService.getPostById(postId),
    enabled: Number.isFinite(postId),
  });
}

/**
 * Patches one post everywhere it is cached — the feed pages, a profile grid, the
 * saved grid and the post detail — so an optimistic like never disagrees with
 * itself between the modal and the card underneath it.
 */
function usePatchPost() {
  const queryClient = useQueryClient();

  return (postId: number, patch: (post: Post) => Post) => {
    queryClient.setQueryData<Post>(queryKeys.posts.detail(postId), (post) =>
      post ? patch(post) : post,
    );

    const patchList = (list: Post[]) =>
      list.map((post) => (post.postId === postId ? patch(post) : post));

    // Cached post lists come in two shapes: a plain array (useMyPosts, useFeed) or
    // an InfiniteData<Post[]> (useUserPosts, useReels, useExplorePosts, favorites).
    const patchEither = (data: Post[] | InfiniteData<Post[]> | undefined) => {
      if (!data) return data;
      if (Array.isArray(data)) return patchList(data);
      return { ...data, pages: data.pages.map(patchList) };
    };

    queryClient.setQueriesData<Post[] | InfiniteData<Post[]>>(
      { queryKey: queryKeys.posts.all },
      patchEither,
    );

    queryClient.setQueriesData<Post[] | InfiniteData<Post[]>>(
      { queryKey: queryKeys.profile.favorites() },
      patchEither,
    );
  };
}

/** like-post is a toggle: the response is the new state, so we only roll back on error. */
export function useLikePost() {
  const patch = usePatchPost();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (post: Post) => postService.likePost(post.postId),
    onMutate: (post) => {
      const next = !post.postLike;
      patch(post.postId, (current) => ({
        ...current,
        postLike: next,
        postLikeCount: Math.max(0, current.postLikeCount + (next ? 1 : -1)),
      }));
      return { previous: post };
    },
    onError: (error: ApiError, _post, context) => {
      if (context?.previous) {
        const { postLike, postLikeCount } = context.previous;
        patch(context.previous.postId, (current) => ({ ...current, postLike, postLikeCount }));
      }
      toast.error(error.message || t("network"));
    },
  });
}

export function useSavePost() {
  const patch = usePatchPost();
  const queryClient = useQueryClient();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (post: Post) => postService.addPostFavorite({ postId: post.postId }),
    onMutate: (post) => {
      patch(post.postId, (current) => ({ ...current, postFavorite: !post.postFavorite }));
      return { previous: post };
    },
    onError: (error: ApiError, _post, context) => {
      if (context?.previous) {
        const { postFavorite } = context.previous;
        patch(context.previous.postId, (current) => ({ ...current, postFavorite }));
      }
      toast.error(error.message || t("network"));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.profile.favorites() }),
  });
}

/** Fire-and-forget; the backend de-duplicates views per user, we de-duplicate per session. */
export function useViewPost() {
  const seen = useRef(new Set<number>());

  return (postId: number) => {
    if (seen.current.has(postId)) return;
    seen.current.add(postId);
    void postService.viewPost(postId).catch(() => seen.current.delete(postId));
  };
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (postId: number) => postService.deletePost(postId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
    },
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}

export function useAddPost() {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (dto: AddPostDto) => postService.addPost(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
    },
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}
