import { http } from "@/lib/axios";
import type { CursorParams } from "@/lib/cursor";
import type { FeedDto } from "@/types/api.types";

/**
 * Swagger tag: feed (1 endpoint) — new in the 19.07.2026 swagger refresh.
 *
 * Functionally identical to `postService.getFeed` (`GET /posts/feed`): the
 * same ranking description (closeness + freshness + engagement), the same
 * `FeedDto` response, the same cursor/limit params. This reads as the
 * dedicated top-level resource the backend is migrating feed onto, so
 * `useFeed` calls this one now — `/posts/feed` is the retired duplicate
 * (same reasoning as `GET /posts` vs `/search/explore`, see `API_MAP_V2.md`).
 */
export const feedService = {
  getFeed: (params: CursorParams) => http.get<FeedDto>("/feed", params),
};
