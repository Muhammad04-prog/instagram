import { http } from "@/lib/axios";
import type { CursorParams } from "@/lib/cursor";
import type { MusicDto, SaveMusicDto } from "@/types/api.types";

export interface SearchMusicParams extends CursorParams {
  /** Matches title AND artist. */
  q?: string;
}

/**
 * Swagger tag: music (6 endpoints).
 *
 * Created early, for Phase 14's music picker: a post takes a `musicId`, so
 * without a way to find a track the field could never be filled. The player,
 * "Trending" and saved-music screens are Phase 18.
 *
 * `streamUrl` supports Range requests, so seeking works with a plain <audio>.
 */
export const musicService = {
  search: (params: SearchMusicParams) => http.get<MusicDto[]>("/music", params),

  getTrending: (params: CursorParams) => http.get<MusicDto[]>("/music/trending", params),

  getById: (id: number) => http.get<MusicDto>(`/music/${id}`),

  /** Idempotent. */
  save: (id: number) => http.post<SaveMusicDto>(`/music/${id}/save`),

  unsave: (id: number) => http.delete<SaveMusicDto>(`/music/${id}/save`),
};
