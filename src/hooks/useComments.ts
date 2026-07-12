"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { type ApiError } from "@/lib/axios";
import { queryKeys } from "@/lib/query-keys";
import { postService } from "@/services/post.service";
import type { AddCommentDto } from "@/types/post.types";

/**
 * Comments ride along inside the post DTO (`comments[]`), so there is no comment
 * list endpoint to invalidate — refetching the post is what refreshes them.
 */
export function useAddComment(postId: number) {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (dto: AddCommentDto) => postService.addComment(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}

export function useDeleteComment(postId: number) {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (commentId: number) => postService.deleteComment(commentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}
