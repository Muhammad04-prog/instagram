import { http } from "@/lib/axios";
import type { CursorParams, Page } from "@/lib/cursor";
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
  search: (params: SearchMusicParams) => http.get<Page<MusicDto>>("/music", params),

  getTrending: (params: CursorParams) => http.get<MusicDto[]>("/music/trending", params),

  getById: (id: number) => http.get<MusicDto>(`/music/${id}`),

  /**
   * The URL an `<audio>` element can actually load the track from.
   *
   * **Not** `MusicDto.streamUrl`: that is an absolute link straight at the
   * backend (the Swagger example even says `http://localhost:3000`), and our
   * access token lives in an httpOnly cookie for *our* origin — a direct
   * request carries no Authorization header and comes back 401.
   *
   * So we address our own proxy, which attaches the token server-side. It
   * forwards `Range` and returns 206 untouched, so seeking works exactly as it
   * would against the origin.
   */
  streamUrl: (id: number) => `/api/proxy/music/${id}/stream`,

  /** Idempotent. */
  save: (id: number) => http.post<SaveMusicDto>(`/music/${id}/save`),

  unsave: (id: number) => http.delete<SaveMusicDto>(`/music/${id}/save`),
};
