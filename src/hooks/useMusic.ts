"use client";

import type { InfiniteData } from "@tanstack/react-query";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiError } from "@/hooks/useApiError";
import { cursorParams, nextCursor } from "@/lib/cursor";
import { queryKeys } from "@/lib/query-keys";
import { musicService } from "@/services/music.service";
import { profileService } from "@/services/profile.service";
import { usePlayerStore } from "@/store/player.store";
import type { MusicDto, SaveOnlineTrackDto } from "@/types/api.types";

const PAGE_SIZE = 20;

// No useMusicTrack hook: the one place that needs a full track by id is
// PostMusicStrip, and it needs it once, on tap — a query with no screen behind
// it would just be dead code.

/** "Use this audio" — reels built with this track, newest first. */
export function useMusicReels(id: number, enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.music.reels(id),
    queryFn: ({ pageParam }) => musicService.getReels(id, cursorParams(pageParam, PAGE_SIZE)),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => nextCursor(lastPage, PAGE_SIZE),
    enabled,
  });
}

/** `q` matches title AND artist. Empty term is the caller's business, not ours. */
export function useMusicSearch(q: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.music.search(q),
    queryFn: ({ pageParam }) => musicService.search({ q, ...cursorParams(pageParam, PAGE_SIZE) }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => nextCursor(last, PAGE_SIZE),
    enabled: q.length > 0,
  });
}

/** Which external catalogues (Spotify/Deezer) are actually up right now. */
export function useOnlineMusicProviders() {
  return useQuery({
    queryKey: queryKeys.music.onlineProviders(),
    queryFn: () => musicService.getOnlineProviders(),
    staleTime: 10 * 60 * 1000,
  });
}

/** Any song, not just what's already in our library — real IG's "search any song". */
export function useOnlineMusicSearch(q: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.music.online(q),
    queryFn: () => musicService.searchOnline({ q, limit: 10 }),
    enabled: enabled && q.length > 0,
  });
}

/** Idempotent import — picking an external track saves it first so it has a `musicId`. */
export function useSaveOnlineTrack() {
  const toMessage = useApiError();

  return useMutation({
    mutationFn: (dto: SaveOnlineTrackDto) => musicService.saveOnline(dto),
    onError: (error) => toast.error(toMessage(error)),
  });
}

export function useTrendingMusic() {
  return useInfiniteQuery({
    queryKey: queryKeys.music.trending(),
    queryFn: ({ pageParam }) => musicService.getTrending(cursorParams(pageParam, PAGE_SIZE)),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => nextCursor(last, PAGE_SIZE),
  });
}

export function useSavedMusic() {
  return useInfiniteQuery({
    queryKey: queryKeys.music.saved(),
    queryFn: ({ pageParam }) => profileService.getSavedMusic(cursorParams(pageParam, PAGE_SIZE)),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => nextCursor(last, PAGE_SIZE),
  });
}

type TrackPages = InfiniteData<MusicDto[], unknown>;

/**
 * Save is idempotent and unsave is its mirror, so the bookmark can flip first
 * and only apologise if the server disagrees.
 *
 * The same track can be on screen in several lists at once (trending, search,
 * saved) and `isSaved` rides on every copy, so the flip has to reach all of
 * them — `setQueriesData` over the whole `music` key does that in one pass.
 * Writing only to the `detail` cache would have looked right and done nothing:
 * no list reads that key, so the bookmark would sit still until a refetch.
 */
export function useToggleSaveMusic() {
  const queryClient = useQueryClient();
  const toMessage = useApiError();

  return useMutation({
    mutationFn: (track: MusicDto) =>
      track.isSaved ? musicService.unsave(track.id) : musicService.save(track.id),

    onMutate: async (track) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.music.all });
      const previous = queryClient.getQueriesData({ queryKey: queryKeys.music.all });

      const flip = (item: MusicDto) =>
        item.id === track.id ? { ...item, isSaved: !track.isSaved } : item;

      // The player holds its own copy of the track, outside the cache — patch it
      // too, or saving from the bar leaves the bar's own label unchanged.
      usePlayerStore.getState().patchTrack(track.id, { isSaved: !track.isSaved });

      queryClient.setQueriesData({ queryKey: queryKeys.music.all }, (old: unknown) => {
        if (!old) return old;
        // Two shapes live under this key: paged lists and a single track.
        if (typeof old === "object" && "pages" in old) {
          const paged = old as TrackPages;
          return { ...paged, pages: paged.pages.map((page: MusicDto[]) => page.map(flip)) };
        }
        return flip(old as MusicDto);
      });

      return { previous };
    },

    onError: (error, track, context) => {
      usePlayerStore.getState().patchTrack(track.id, { isSaved: track.isSaved });
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error(toMessage(error));
    },

    // The saved list gains or loses a row, which no local flip can fake.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.music.saved() });
    },
  });
}
