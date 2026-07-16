import { http } from "@/lib/axios";
import type { CursorParams } from "@/lib/cursor";
import type { PostDto, SearchResultDto, TopResultDto } from "@/types/api.types";

/**
 * Swagger tag: search (4 endpoints).
 *
 * Only `getHashtag` is used so far — hashtags in a caption have to lead
 * somewhere real. The combined search, the explore grid and the trends screen
 * are Phase 19; they are typed here so the whole tag lives in one file.
 */
export const searchService = {
  /** Accounts + hashtags + locations in one response. */
  search: (q: string) => http.get<SearchResultDto>("/search", { q }),

  /** Explore grid: photos and videos mixed. */
  getExplore: (params: CursorParams) => http.get<PostDto[]>("/search/explore", params),

  /** Trending hashtags + accounts of the week. */
  getTop: () => http.get<TopResultDto>("/search/top"),

  /** Every post carrying a hashtag. `name` travels without the leading '#'. */
  getHashtag: (name: string, params: CursorParams) =>
    http.get<PostDto[]>(`/search/hashtag/${encodeURIComponent(name)}`, params),
};
