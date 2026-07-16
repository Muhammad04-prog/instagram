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
import { type ApiError } from "@/lib/axios";
import { EXPLORE_PAGE_SIZE, FEED_PAGE_SIZE, PAGE_SIZE, REELS_PAGE_SIZE } from "@/lib/constants";
import { cursorParams, nextCursor } from "@/lib/cursor";
import { queryKeys } from "@/lib/query-keys";
import { postService, type CreatePostInput } from "@/services/post.service";
import { profileService } from "@/services/profile.service";
import { searchService } from "@/services/search.service";
import type { PostDto, ReportPostDto, ShareDto } from "@/types/api.types";

/**
 * `/` — the feed.
 *
 * Cursor-paginated and scoped to me server-side. Softclub needed my UserId
 * passed explicitly or it silently answered an empty feed (bug #21), and it
 * ignored paging entirely — neither is true here.
 */
export function useFeed() {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.feed(),
    queryFn: ({ pageParam }) => postService.getFeed(cursorParams(pageParam, FEED_PAGE_SIZE)),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => nextCursor(lastPage, FEED_PAGE_SIZE),
  });
}

/** Someone else's grid. A private account answers 403 — that is the gate, not an error. */
export function useUserPosts(userId: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.byUser(userId),
    queryFn: ({ pageParam }) =>
      profileService.getUserPosts(userId, cursorParams(pageParam, PAGE_SIZE)),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => nextCursor(lastPage, PAGE_SIZE),
    enabled: enabled && Boolean(userId),
  });
}

/** Their reels tab — a real endpoint now, no client-side filtering of the grid. */
export function useUserReels(userId: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.reelsByUser(userId),
    queryFn: ({ pageParam }) =>
      profileService.getUserReels(userId, cursorParams(pageParam, PAGE_SIZE)),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => nextCursor(lastPage, PAGE_SIZE),
    enabled: enabled && Boolean(userId),
  });
}

export function useUserTagged(userId: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.taggedByUser(userId),
    queryFn: ({ pageParam }) =>
      profileService.getUserTagged(userId, cursorParams(pageParam, PAGE_SIZE)),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => nextCursor(lastPage, PAGE_SIZE),
    enabled: enabled && Boolean(userId),
  });
}

export function useMyPosts(enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.mine(),
    queryFn: ({ pageParam }) => postService.getMyPosts(cursorParams(pageParam, PAGE_SIZE)),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => nextCursor(lastPage, PAGE_SIZE),
    enabled,
  });
}

/** /reels — video posts. They are ordinary PostDto rows, so every post hook works on them. */
export function useReels() {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.reels(),
    queryFn: ({ pageParam }) => postService.getReels(cursorParams(pageParam, REELS_PAGE_SIZE)),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => nextCursor(lastPage, REELS_PAGE_SIZE),
  });
}

/**
 * /explore — docs/screenshots/img23.
 *
 * `/search/explore` is the endpoint built for this grid (photos and videos
 * mixed, ranked); `/posts` is the plain "other people's posts" list we used
 * before it existed in our services.
 */
export function useExplorePosts() {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.explore(),
    queryFn: ({ pageParam }) =>
      searchService.getExplore(cursorParams(pageParam, EXPLORE_PAGE_SIZE)),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => nextCursor(lastPage, EXPLORE_PAGE_SIZE),
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
 * Patches one post everywhere it is cached — every feed/grid page and the detail
 * — so an optimistic like never disagrees with itself between the modal and the
 * card underneath it.
 */
function usePatchPost() {
  const queryClient = useQueryClient();

  return (postId: number, patch: (post: PostDto) => PostDto) => {
    queryClient.setQueryData<PostDto>(queryKeys.posts.detail(postId), (post) =>
      post ? patch(post) : post,
    );

    const patchPages = (data: InfiniteData<PostDto[]> | undefined) =>
      data?.pages
        ? {
            ...data,
            pages: data.pages.map((page) =>
              page.map((post) => (post.id === postId ? patch(post) : post)),
            ),
          }
        : data;

    queryClient.setQueriesData<InfiniteData<PostDto[]>>(
      { queryKey: queryKeys.posts.all },
      patchPages,
    );
    queryClient.setQueriesData<InfiniteData<PostDto[]>>(
      { queryKey: queryKeys.profile.all },
      patchPages,
    );
  };
}

/**
 * Like is a toggle, and the response carries the authoritative `{ liked,
 * likesCount }` — so we flip optimistically and then settle on the server's
 * numbers rather than trusting our own arithmetic.
 */
export function useLikePost() {
  const patch = usePatchPost();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (post: PostDto) => postService.like(post.id),
    onMutate: (post) => {
      const next = !post.isLiked;
      patch(post.id, (current) => ({
        ...current,
        isLiked: next,
        likesCount: Math.max(0, current.likesCount + (next ? 1 : -1)),
      }));
      return { previous: post };
    },
    onSuccess: (result, post) => {
      patch(post.id, (current) => ({
        ...current,
        isLiked: result.liked,
        likesCount: result.likesCount,
      }));
    },
    onError: (error: ApiError, _post, context) => {
      if (context?.previous) {
        const { isLiked, likesCount } = context.previous;
        patch(context.previous.id, (current) => ({ ...current, isLiked, likesCount }));
      }
      toast.error(error.message || t("network"));
    },
  });
}

/**
 * Save / unsave. Toggle → `{ favorited }`.
 *
 * `collection` files it under a named collection. The API takes a **name**, not
 * an id, and exposes no way to list collections back — so the UI asks for a name
 * rather than offering a picker over something it cannot read.
 */
export function useSavePost() {
  const patch = usePatchPost();
  const queryClient = useQueryClient();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: ({ post, collection }: { post: PostDto; collection?: string }) =>
      postService.favorite(post.id, collection),
    onMutate: ({ post }) => {
      patch(post.id, (current) => ({ ...current, isFavorited: !post.isFavorited }));
      return { previous: post };
    },
    onSuccess: (result, { post }) => {
      patch(post.id, (current) => ({ ...current, isFavorited: result.favorited }));
    },
    onError: (error: ApiError, _vars, context) => {
      if (context?.previous) {
        const { isFavorited } = context.previous;
        patch(context.previous.id, (current) => ({ ...current, isFavorited }));
      }
      toast.error(error.message || t("network"));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.profile.favorites() }),
  });
}

/** Fire-and-forget; the backend counts one view per user, we de-duplicate per session. */
export function useViewPost() {
  const seen = useRef(new Set<number>());

  return (postId: number) => {
    if (seen.current.has(postId)) return;
    seen.current.add(postId);
    void postService.view(postId).catch(() => seen.current.delete(postId));
  };
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (postId: number) => postService.remove(postId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
    },
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}

/** Who liked a post (img13's likes list). */
export function usePostLikes(postId: number, enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.likes(postId),
    queryFn: ({ pageParam }) => postService.getLikes(postId, cursorParams(pageParam, PAGE_SIZE)),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => nextCursor(lastPage, PAGE_SIZE),
    enabled: enabled && Number.isFinite(postId),
  });
}

/**
 * Share: into a chat (`toUserId`), into my story (`toStory`), or just a link.
 *
 * Sharing to a story used to mean re-uploading the post as a new story file —
 * that was all softclub could do. This is one call, and the server builds the
 * story itself.
 */
export function useSharePost(postId: number) {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (dto: ShareDto) => postService.share(postId, dto),
    onSuccess: (_result, dto) => {
      if (dto.toStory) void queryClient.invalidateQueries({ queryKey: queryKeys.stories.all });
      if (dto.toUserId) void queryClient.invalidateQueries({ queryKey: queryKeys.chats.all });
    },
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}

export function useReportPost(postId: number) {
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (dto: ReportPostDto) => postService.report(postId, dto),
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}

/**
 * Archive / restore. Toggle → `{ isArchived }`.
 *
 * An archived post leaves the grid but is not deleted — softclub had no archive
 * at all, so "Archive" simply did not exist as an option.
 */
export function useArchivePost() {
  const patch = usePatchPost();
  const queryClient = useQueryClient();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: ({ postId, archive }: { postId: number; archive: boolean }) =>
      archive ? postService.archive(postId) : postService.unarchive(postId),
    onSuccess: (result, { postId }) => {
      patch(postId, (current) => ({ ...current, isArchived: result.isArchived }));
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
    },
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}

/** Caption only — the server re-parses hashtags out of the new text. */
export function useUpdatePost() {
  const patch = usePatchPost();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: ({ postId, caption }: { postId: number; caption: string }) =>
      postService.update(postId, { caption }),
    onSuccess: (updated) => patch(updated.id, () => updated),
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}

export function useAddPost() {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (input: CreatePostInput) => postService.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
    },
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}
