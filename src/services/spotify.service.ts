import { http } from "@/lib/axios";
import type { MusicDto, SaveMusicDto, SpotifyTrackDto } from "@/types/api.types";

/**
 * Swagger tag: spotify (3 endpoints).
 *
 * A way to pull tracks that are not in our library yet. Search is Spotify's
 * catalogue; saving **imports** the track — the backend answers with a full
 * `MusicDto`, i.e. it now exists locally with an id of its own and can be
 * played, attached to a post, and saved like any other.
 *
 * Note the shapes differ from `music`: search takes `q` + `limit` and has **no
 * cursor**, so there is no paging here — Spotify's own API is asked once.
 */
export const spotifyService = {
  search: (q: string, limit = 20) => http.get<SpotifyTrackDto[]>("/spotify/search", { q, limit }),

  /** Imports into my music and returns the local track it became. */
  save: (spotifyId: string) => http.post<MusicDto>(`/spotify/tracks/${spotifyId}/save`),

  unsave: (spotifyId: string) => http.delete<SaveMusicDto>(`/spotify/tracks/${spotifyId}/save`),
};
