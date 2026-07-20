"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { toast } from "sonner";
import { type ApiError } from "@/lib/axios";
import { PAGE_SIZE } from "@/lib/constants";
import { cursorParams, MAX_LIMIT, nextCursor } from "@/lib/cursor";
import { queryKeys } from "@/lib/query-keys";
import { storyService, type CreateStoriesInput } from "@/services/story.service";
import type {
  AnswerStickerDto,
  CreateAddYoursDto,
  CreateStickerDto,
  StoryDto,
} from "@/types/api.types";

/** The rail, grouped by author. `allViewed` drives the grey ring — server-side truth now. */
export function useStories() {
  return useQuery({
    queryKey: queryKeys.stories.rail(),
    queryFn: () => storyService.getRail(),
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

/** Expired stories (img45). */
export function useStoryArchive() {
  return useInfiniteQuery({
    queryKey: queryKeys.stories.archive(),
    queryFn: ({ pageParam }) => storyService.getArchive(cursorParams(pageParam, PAGE_SIZE)),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => nextCursor(lastPage, PAGE_SIZE),
  });
}

/**
 * Who watched a story — a real list of people (viewed / liked / reaction), only
 * visible to the author. Softclub could only answer two bare counters, so
 * Phase 6 had to show numbers and admit no list existed.
 *
 * ⚠️ Not paginated here on purpose: `StoryViewerDto` carries no id of its own,
 * and the cursor *is* the last row's id — so there is nothing to page with. We
 * ask for the cap (50) in one go. A story with more viewers than that will be
 * truncated; revisit if the backend adds an id or a nextCursor.
 */
export function useStoryViewers(storyId: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.stories.viewers(storyId),
    queryFn: () => storyService.getViewers(storyId, { limit: MAX_LIMIT }),
    enabled: enabled && Number.isFinite(storyId),
  });
}

/**
 * One story by id — the only place `GET /stories/{id}` fits: the archive grid
 * holds ids, and opening a tile needs the full row (media, music, overlays).
 */
export function useStoryDetail(storyId: number | null) {
  return useQuery({
    queryKey: queryKeys.stories.detail(storyId ?? 0),
    queryFn: () => storyService.getStoryById(storyId as number),
    enabled: storyId !== null,
  });
}

export function useAddStory() {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (input: CreateStoriesInput) => storyService.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.stories.all }),
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}

export function useDeleteStory() {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (id: number) => storyService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.stories.all }),
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}

/** Toggle → `{ liked, likesCount }`, so the heart settles on the server's count. */
export function useLikeStory(userId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");
  const key = queryKeys.stories.byUser(userId);

  return useMutation({
    mutationFn: (storyId: number) => storyService.like(storyId),
    onMutate: async (storyId) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<StoryDto[]>(key);

      queryClient.setQueryData<StoryDto[]>(key, (stories) =>
        stories?.map((story) =>
          story.id === storyId
            ? {
                ...story,
                isLiked: !story.isLiked,
                likesCount: Math.max(0, story.likesCount + (story.isLiked ? -1 : 1)),
              }
            : story,
        ),
      );

      return { previous };
    },
    onSuccess: (result, storyId) => {
      queryClient.setQueryData<StoryDto[]>(key, (stories) =>
        stories?.map((story) =>
          story.id === storyId
            ? { ...story, isLiked: result.liked, likesCount: result.likesCount }
            : story,
        ),
      );
    },
    onError: (error: ApiError, _storyId, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      toast.error(error.message || t("network"));
    },
  });
}

/**
 * Marks a story seen, once per session.
 *
 * The server owns "have I seen this?" now (`StoryDto.isViewed`,
 * `StoryRailItemDto.allViewed`), so the localStorage ring-state store from
 * Phase 6 is gone — the grey ring is finally correct in any browser.
 */
export function useMarkStorySeen() {
  const queryClient = useQueryClient();
  const sent = useRef(new Set<number>());

  return (storyId: number) => {
    if (sent.current.has(storyId)) return;
    sent.current.add(storyId);

    void storyService
      .view(storyId)
      .then(() => queryClient.invalidateQueries({ queryKey: queryKeys.stories.rail() }))
      .catch(() => sent.current.delete(storyId));
  };
}

/** Author-only analytics; the server 403s anyone else. */
export function useStoryInsights(storyId: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.stories.insights(storyId),
    queryFn: () => storyService.getInsights(storyId),
    enabled: enabled && Number.isFinite(storyId),
  });
}

/** Turns my own story into the first link of an "Add Yours" chain. */
export function useCreateAddYours() {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: ({ storyId, dto }: { storyId: number; dto: CreateAddYoursDto }) =>
      storyService.createAddYours(storyId, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.stories.all }),
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}

/**
 * The prompt + every response story so far.
 *
 * `AddYoursFeedDto` is its own shape (`{ prompt, items, nextCursor?, hasMore }`),
 * not a plain `Page<StoryDto>` — the prompt rides along on every page, so this
 * paginates by hand rather than through the generic cursor helpers.
 */
export function useAddYoursFeed(promptId: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.stories.addYours(promptId), "feed"] as const,
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      storyService.getAddYoursFeed(promptId, cursorParams(pageParam, PAGE_SIZE)),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
    enabled: enabled && Boolean(promptId),
  });
}

/**
 * Stickers on a story — fetched per-slide (not part of `StoryDto` itself),
 * `myAnswer` tells the viewer whether they've already answered.
 */
export function useStoryStickers(storyId: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.stories.stickers(storyId),
    queryFn: () => storyService.getStickers(storyId),
    enabled: enabled && Number.isFinite(storyId),
  });
}

/** Takes the story id at call time — `StoryUploadDialog` only learns it once upload succeeds. */
export function useCreateSticker() {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: ({ storyId, dto }: { storyId: number; dto: CreateStickerDto }) =>
      storyService.createSticker(storyId, dto),
    onSuccess: (_result, { storyId }) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.stories.stickers(storyId) }),
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}

/** Answering again replaces the previous answer — an optimistic re-fetch is enough. */
export function useAnswerSticker(storyId: number) {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: ({ stickerId, dto }: { stickerId: string; dto: AnswerStickerDto }) =>
      storyService.answerSticker(storyId, stickerId, dto),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.stories.stickers(storyId) }),
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}

/** Author-only tally — only fetched once the results sheet is opened. */
export function useStickerResults(storyId: number, stickerId: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.stories.stickerResults(storyId, stickerId),
    queryFn: () => storyService.getStickerResults(storyId, stickerId),
    enabled: enabled && Number.isFinite(storyId) && Boolean(stickerId),
  });
}
