"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiError } from "@/hooks/useApiError";
import { queryKeys } from "@/lib/query-keys";
import { spotifyService } from "@/services/spotify.service";
import type { SpotifyTrackDto } from "@/types/api.types";

/** No cursor on this endpoint — Spotify is asked once, for one page. */
export function useSpotifySearch(q: string) {
  return useQuery({
    queryKey: queryKeys.spotify.search(q),
    queryFn: () => spotifyService.search(q),
    enabled: q.length > 0,
  });
}

/**
 * Saving imports the track into our library; unsaving drops it again.
 *
 * `isSaved` lives on the Spotify row, so flip that optimistically. The import
 * also changes **our** music (a new track appears in Saved), which no local
 * edit can invent — hence the invalidation of the music key on settle.
 */
export function useToggleSaveSpotify(q: string) {
  const queryClient = useQueryClient();
  const toMessage = useApiError();

  return useMutation({
    // The two calls answer different shapes (save returns the imported MusicDto,
    // unsave a flag) and neither is needed here — the caches are refetched — so
    // the result is dropped rather than typed into a union nobody reads.
    mutationFn: async (track: SpotifyTrackDto): Promise<void> => {
      if (track.isSaved) await spotifyService.unsave(track.spotifyId);
      else await spotifyService.save(track.spotifyId);
    },

    onMutate: async (track) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.spotify.search(q) });
      const previous = queryClient.getQueryData<SpotifyTrackDto[]>(queryKeys.spotify.search(q));

      queryClient.setQueryData(queryKeys.spotify.search(q), (old: SpotifyTrackDto[] | undefined) =>
        old?.map((item) =>
          item.spotifyId === track.spotifyId ? { ...item, isSaved: !track.isSaved } : item,
        ),
      );

      return { previous };
    },

    onError: (error, _track, context) => {
      queryClient.setQueryData(queryKeys.spotify.search(q), context?.previous);
      toast.error(toMessage(error));
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.music.all });
    },
  });
}
