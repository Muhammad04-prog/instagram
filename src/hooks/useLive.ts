"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiError } from "@/hooks/useApiError";
import { queryKeys } from "@/lib/query-keys";
import { liveService } from "@/services/live.service";
import type { LiveDto, StartLiveDto } from "@/types/api.types";

/**
 * A broadcast changes every few seconds and nobody pushes those changes to us:
 * the socket has no auth ticket we can use and no documented events, so the
 * screens poll. Slow enough not to hammer the API, fast enough that a viewer
 * count does not look frozen.
 */
const LIVE_POLL_MS = 5_000;
const RAIL_POLL_MS = 30_000;

/** Active broadcasts from people you follow — feeds the story rail. */
export function useLiveFeed() {
  return useQuery({
    queryKey: queryKeys.live.feed(),
    queryFn: () => liveService.getFeed(),
    refetchInterval: RAIL_POLL_MS,
  });
}

/** Is this user live right now? Drives the LIVE ring on their profile. */
export function useLiveByUser(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.live.byUser(userId ?? ""),
    queryFn: () => liveService.getByUser(userId ?? ""),
    enabled: Boolean(userId),
    refetchInterval: RAIL_POLL_MS,
  });
}

export function useLive(id: string) {
  return useQuery({
    queryKey: queryKeys.live.detail(id),
    queryFn: () => liveService.getById(id),
    refetchInterval: (query) =>
      // An ended broadcast never changes again — stop polling a dead room.
      query.state.data?.status === "ENDED" ? false : LIVE_POLL_MS,
  });
}

export function useLiveViewers(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.live.viewers(id),
    queryFn: () => liveService.getViewers(id),
    enabled,
    refetchInterval: LIVE_POLL_MS,
  });
}

/** Host-only, and only worth asking once the broadcast has ended. */
export function useLiveStats(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.live.stats(id),
    queryFn: () => liveService.getStats(id),
    enabled,
  });
}

export function useStartLive() {
  const queryClient = useQueryClient();
  const toMessage = useApiError();

  return useMutation({
    mutationFn: (body: StartLiveDto) => liveService.start(body),
    onSuccess: ({ live }) => {
      queryClient.setQueryData(queryKeys.live.detail(live.id), live);
      void queryClient.invalidateQueries({ queryKey: queryKeys.live.feed() });
    },
    onError: (error) => toast.error(toMessage(error)),
  });
}

/**
 * Join hands back a subscriber token **and** the broadcast, so the screen has
 * everything it needs from one call. Refused when the host blocked you or is
 * private and you do not follow them.
 */
export function useJoinLive(id: string) {
  const queryClient = useQueryClient();
  const toMessage = useApiError();

  return useMutation({
    mutationFn: () => liveService.join(id),
    onSuccess: ({ live }) => queryClient.setQueryData(queryKeys.live.detail(id), live),
    onError: (error) => toast.error(toMessage(error)),
  });
}

export function useLeaveLive(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => liveService.leave(id),
    // Leaving is fire-and-forget on the way out; a failure here must not block
    // navigation, and the viewer list is refetched by whoever is still there.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.live.viewers(id) });
    },
  });
}

export function useEndLive(id: string) {
  const queryClient = useQueryClient();
  const toMessage = useApiError();

  return useMutation({
    mutationFn: () => liveService.end(id),
    onSuccess: (stats) => {
      queryClient.setQueryData(queryKeys.live.stats(id), stats);
      queryClient.setQueryData(queryKeys.live.detail(id), (old: LiveDto | undefined) =>
        old ? { ...old, status: "ENDED" as const, endedAt: new Date().toISOString() } : old,
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.live.feed() });
    },
    onError: (error) => toast.error(toMessage(error)),
  });
}

/**
 * Each tap is one heart — the server counts them all, so this is deliberately
 * not idempotent and there is nothing to roll back.
 */
export function useLikeLive(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => liveService.like(id),
    onSuccess: ({ likesCount }) => {
      queryClient.setQueryData(queryKeys.live.detail(id), (old: LiveDto | undefined) =>
        old ? { ...old, likesCount } : old,
      );
    },
  });
}

export function useLiveReaction(id: string) {
  return useMutation({ mutationFn: (emoji: string) => liveService.reaction(id, emoji) });
}

/**
 * The comment comes back alone — there is no endpoint to read the stream — so
 * the caller keeps what it sent. See `live.service.ts`.
 */
export function useLiveComment(id: string) {
  const toMessage = useApiError();

  return useMutation({
    mutationFn: (text: string) => liveService.comment(id, text),
    onError: (error) => toast.error(toMessage(error)),
  });
}

export function useRequestJoinLive(id: string) {
  const toMessage = useApiError();

  return useMutation({
    mutationFn: () => liveService.requestJoin(id),
    onError: (error) => toast.error(toMessage(error)),
  });
}

// No hook for accept/decline: a host cannot reach either one. Both take a
// request id, nothing lists pending requests, and `NotificationDto` carries
// postId/commentId/storyId/noteId but no requestId — so the id never arrives
// anywhere a host could act on it. Wiring a hook to a screen that cannot exist
// would only make the API map look better than the app is.
// Asked for in docs/BACKEND_REQUEST.md; the service methods are ready.

/** Camera off keeps the audio running — the cover stands in for the picture. */
export function useSetLiveCamera(id: string) {
  const queryClient = useQueryClient();
  const toMessage = useApiError();

  return useMutation({
    mutationFn: ({ on, coverUrl }: { on: boolean; coverUrl?: string }) =>
      liveService.setCamera(id, on, coverUrl),
    onMutate: async ({ on }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.live.detail(id) });
      const previous = queryClient.getQueryData<LiveDto>(queryKeys.live.detail(id));
      queryClient.setQueryData(queryKeys.live.detail(id), (old: LiveDto | undefined) =>
        old ? { ...old, isCameraOn: on } : old,
      );
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.live.detail(id), context.previous);
      toast.error(toMessage(error));
    },
  });
}

export function useSetLiveAudio(id: string) {
  const queryClient = useQueryClient();
  const toMessage = useApiError();

  return useMutation({
    mutationFn: (on: boolean) => liveService.setAudio(id, on),
    onMutate: async (on) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.live.detail(id) });
      const previous = queryClient.getQueryData<LiveDto>(queryKeys.live.detail(id));
      queryClient.setQueryData(queryKeys.live.detail(id), (old: LiveDto | undefined) =>
        old ? { ...old, isAudioOn: on } : old,
      );
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.live.detail(id), context.previous);
      toast.error(toMessage(error));
    },
  });
}

export function useKickFromLive(id: string) {
  const queryClient = useQueryClient();
  const toMessage = useApiError();

  return useMutation({
    mutationFn: (userId: string) => liveService.kick(id, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.live.viewers(id) });
    },
    onError: (error) => toast.error(toMessage(error)),
  });
}
