"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { toast } from "sonner";
import { type ApiError } from "@/lib/axios";
import { queryKeys } from "@/lib/query-keys";
import { storyService } from "@/services/story.service";
import { useStoryStore } from "@/store/story.store";
import type { AddStoryDto } from "@/types/story.types";

export function useStories() {
  return useQuery({
    queryKey: queryKeys.stories.list(),
    queryFn: () => storyService.getStories(),
  });
}

export function useUserStories(userId: string) {
  return useQuery({
    queryKey: queryKeys.stories.byUser(userId),
    queryFn: () => storyService.getUserStories(userId),
    enabled: Boolean(userId),
  });
}

export function useMyStories() {
  return useQuery({
    queryKey: queryKeys.stories.mine(),
    queryFn: () => storyService.getMyStories(),
  });
}

/** Only GetStoryById carries `viewerDto` (viewCount / viewLike) — used by the viewers sheet. */
export function useStoryDetail(storyId: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.stories.detail(storyId),
    queryFn: () => storyService.getStoryById(storyId),
    enabled: enabled && Number.isFinite(storyId),
  });
}

export function useAddStory() {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (dto: AddStoryDto) => storyService.addStory(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.stories.all }),
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}

export function useDeleteStory() {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (id: number) => storyService.deleteStory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.stories.all }),
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}

/** LikeStory is a toggle answering "Liked" / "Disliked" — we flip optimistically. */
export function useLikeStory() {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (storyId: number) => storyService.likeStory(storyId),
    onSettled: (_data, _error, storyId) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.stories.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stories.detail(storyId) });
    },
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}

/** Fires add-story-view once per story and remembers it for the grey ring. */
export function useMarkStorySeen() {
  const markSeen = useStoryStore((state) => state.markSeen);
  const sent = useRef(new Set<number>());

  return (storyId: number) => {
    markSeen(storyId);
    if (sent.current.has(storyId)) return;
    sent.current.add(storyId);
    void storyService.addStoryView(storyId).catch(() => sent.current.delete(storyId));
  };
}
