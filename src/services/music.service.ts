import { http } from "@/lib/axios";
import type { CursorParams, Page } from "@/lib/cursor";
import type {
  MusicDto,
  OnlineProvidersDto,
  OnlineTrackDto,
  PostDto,
  SaveMusicDto,
  SaveOnlineTrackDto,
} from "@/types/api.types";

export interface SearchMusicParams extends CursorParams {
  /** Matches title AND artist. */
  q?: string;
}

export type OnlineMusicProvider = "SPOTIFY" | "DEEZER";

export interface SearchOnlineMusicParams {
  /** Title or artist. */
  q: string;
  limit?: number;
  /** Defaults to the first available provider. */
  provider?: OnlineMusicProvider;
}

/**
 * Swagger tag: music (9 endpoints).
 *
 * Created early, for Phase 14's music picker: a post takes a `musicId`, so
 * without a way to find a track the field could never be filled. The player,
 * "Trending" and saved-music screens are Phase 18.
 *
 * `streamUrl` supports Range requests, so seeking works with a plain <audio>.
 *
 * The `online*` methods reach an external catalogue (Spotify/Deezer) for
 * songs our own library has never seen — real IG's "search any song".
 * `getOnlineProviders` says which of the two is actually up right now
 * (Spotify needs a Premium subscription on the backend's app, so it may be
 * absent); an external track is only a 30-second preview until `saveOnline`
 * imports it, at which point it becomes a normal `MusicDto`.
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

  /** "Use this audio" — reels built with this track. Closed/blocked accounts excluded. */
  getReels: (id: number, params: CursorParams) =>
    http.get<Page<PostDto>>(`/music/${id}/reels`, params),

  /** Idempotent. */
  save: (id: number) => http.post<SaveMusicDto>(`/music/${id}/save`),

  unsave: (id: number) => http.delete<SaveMusicDto>(`/music/${id}/save`),

  getOnlineProviders: () => http.get<OnlineProvidersDto>("/music/online/providers"),

  searchOnline: (params: SearchOnlineMusicParams) =>
    http.get<OnlineTrackDto[]>("/music/online", params),

  /** Idempotent — importing the same track twice returns the existing row. */
  saveOnline: (dto: SaveOnlineTrackDto) => http.post<MusicDto>("/music/online/save", dto),
};
