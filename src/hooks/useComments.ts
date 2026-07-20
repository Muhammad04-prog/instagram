"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { type ApiError } from "@/lib/axios";
import { COMMENTS_PAGE_SIZE } from "@/lib/constants";
import { cursorParams, nextCursor } from "@/lib/cursor";
import { queryKeys } from "@/lib/query-keys";
import { postService } from "@/services/post.service";
import type { CreateCommentDto } from "@/types/api.types";

/**
 * Comments are their own paginated resource now — softclub shipped them inside
 * the post DTO, with `userName` and `userImage` always null, which is why
 * Phase 5 had to look each author up by id (bug #6). `CommentDto.author` is
 * populated, so that whole detour is gone.
 *
 * The list returns ROOT comments only; replies hang off `useCommentReplies`.
 */
export function useComments(postId: number) {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.comments(postId),
    queryFn: ({ pageParam }) =>
      postService.getComments(postId, cursorParams(pageParam, COMMENTS_PAGE_SIZE)),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => nextCursor(lastPage, COMMENTS_PAGE_SIZE),
    enabled: Number.isFinite(postId),
  });
}

/** "View replies (N)" — fetched only when the thread is expanded. */
export function useCommentReplies(commentId: number, enabled = false) {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.commentReplies(commentId),
    queryFn: ({ pageParam }) =>
      postService.getCommentReplies(commentId, cursorParams(pageParam, COMMENTS_PAGE_SIZE)),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => nextCursor(lastPage, COMMENTS_PAGE_SIZE),
    enabled,
  });
}

/** Invalidates the list and the post (its `commentsCount` moved). */
function useCommentInvalidation(postId: number) {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.posts.comments(postId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
  };
}

export function useAddComment(postId: number) {
  const invalidate = useCommentInvalidation(postId);
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (dto: CreateCommentDto) => postService.addComment(postId, dto),
    onSuccess: invalidate,
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}

export function useReplyToComment(postId: number, commentId: number) {
  const queryClient = useQueryClient();
  const invalidate = useCommentInvalidation(postId);
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (dto: CreateCommentDto) => postService.replyToComment(commentId, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts.commentReplies(commentId) });
      invalidate();
    },
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}

export function useDeleteComment(postId: number) {
  const invalidate = useCommentInvalidation(postId);
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (commentId: number) => postService.deleteComment(commentId),
    onSuccess: invalidate,
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}

/** Toggle → new state + count, so the heart settles on the server's number. */
export function useLikeComment(postId: number) {
  const invalidate = useCommentInvalidation(postId);
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (commentId: number) => postService.likeComment(commentId),
    onSuccess: invalidate,
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}

/**
 * Pin / unpin a comment — only the post's own author may do this (403
 * otherwise). The list is re-sorted client-side by `pinnedAt` (see
 * `CommentList`) rather than trusted to arrive pre-sorted, so a plain
 * invalidate after the toggle is enough here.
 */
export function usePinComment(postId: number) {
  const invalidate = useCommentInvalidation(postId);
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (commentId: number) => postService.pinComment(postId, commentId),
    onSuccess: invalidate,
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}
