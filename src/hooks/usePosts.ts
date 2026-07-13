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
import { postService } from "@/services/post.service";
import type { AddPostDto, Post } from "@/types/post.types";

/**
 * `/` — the feed.
 *
 * ⚠️ `get-following-post` **ignores PageNumber and PageSize**: it always returns
 * the whole feed (verified — pages 1, 2 and 3 come back byte-identical, 56 posts
 * each, with PageSize=5). Asking for page 2 would therefore duplicate every post.
 * So the feed is a single page: `getNextPageParam` never advances.
 * See docs/BACKEND_BUGS.md #21.
 */
export function useFeed() {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: queryKeys.posts.feed({ userId: user?.userId }),
    queryFn: ({ pageParam }) =>
      postService.getFollowingPosts({
        userId: user?.userId,
        pageNumber: pageParam,
        pageSize: FEED_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: () => undefined,
    enabled: Boolean(user?.userId),
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
 */
export function useReels() {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.reels(),
    queryFn: ({ pageParam }) =>
      postService.getReels({ pageNumber: pageParam, pageSize: REELS_PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < REELS_PAGE_SIZE ? undefined : allPages.length + 1,
    select: (data) => ({
      ...data,
      pages: data.pages.map((page) =>
        page.map((reel): Post => ({ ...reel, images: [reel.images] })),
      ),
    }),
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

    queryClient.setQueriesData<InfiniteData<Post[]>>({ queryKey: queryKeys.posts.all }, (data) =>
      data?.pages
        ? {
            ...data,
            pages: data.pages.map((page) =>
              page.map((post) => (post.postId === postId ? patch(post) : post)),
            ),
          }
        : data,
    );

    queryClient.setQueriesData<InfiniteData<Post[]>>(
      { queryKey: queryKeys.profile.favorites() },
      (data) =>
        data?.pages
          ? {
              ...data,
              pages: data.pages.map((page) =>
                page.map((post) => (post.postId === postId ? patch(post) : post)),
              ),
            }
          : data,
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
