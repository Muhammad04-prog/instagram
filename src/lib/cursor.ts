/**
 * Cursor pagination.
 *
 * ⚠️ Swagger lies here, and this file used to repeat the lie. Every cursor list
 * is declared as a bare array (`PostDto[]`), but the live API answers with an
 * envelope:
 *
 * ```
 * GET /posts/feed → { "items": [...], "nextCursor": "42", "hasMore": true }
 * ```
 *
 * Verified with curl on 17.07.2026, the day the database finally came up — the
 * project rule ("живой API авторитетнее Swagger") caught it within minutes: the
 * feed had been rendering the envelope object *as if it were a post*, so
 * `post.id` and `post.author` came out undefined.
 *
 * Not every list is paginated, and the unpaginated ones really are bare arrays.
 * So the helpers below are shape-aware rather than assuming one or the other.
 *
 * Measured shapes (curl, 17.07.2026):
 * - envelope: posts/feed, posts, posts/reels, posts/my, users, notifications,
 *   notifications/profile-views, profile/favorites, profile/{id}/{posts,reels,
 *   tagged}, profile/me/reposts, follow/{id}/{followers,following},
 *   follow/requests, follow/blocked, locations, music, search/explore,
 *   chats/{id}/messages
 * - bare array: chats, chats/requests, stories, stories/archive, notes,
 *   music/trending, close-friends, highlights/user/{id}, profile/me/saved-music,
 *   profile/me/activity, profile/me/collections, live/feed
 */

/** What a cursor-paginated endpoint actually returns. */
export interface Page<T> {
  items: T[];
  /** Where the next page starts; `null` at the end of the list. */
  nextCursor: string | null;
  hasMore: boolean;
}

/** Anything a cursor can point at. Ids are numbers (posts, chats) or uuids (users). */
export interface Cursorable {
  id: number | string;
}

export interface CursorParams {
  cursor?: string;
  limit?: number;
}

/** Backend caps `limit` at 50 on every cursor endpoint. */
export const MAX_LIMIT = 50;

function isPage<T>(page: Page<T> | T[]): page is Page<T> {
  return !Array.isArray(page) && Array.isArray((page as Page<T>).items);
}

/** The rows of a page, whichever shape the endpoint uses. */
export function pageItems<T>(page: Page<T> | T[]): T[] {
  return isPage(page) ? page.items : page;
}

/** Flattens `useInfiniteQuery`'s pages into one list. */
export function flattenPages<T>(data: { pages: (Page<T> | T[])[] } | undefined): T[] {
  return data?.pages.flatMap((page) => pageItems(page)) ?? [];
}

/**
 * `getNextPageParam` for TanStack Query's `useInfiniteQuery`.
 *
 * An envelope says outright where the next page starts, so we use its
 * `nextCursor` and never second-guess it. A bare array has no such field, and
 * there the cursor is derived from the tail: Swagger defines it as "курсор
 * последнего элемента предыдущей страницы". A short page means the end.
 */
export function nextCursor<T extends Cursorable>(
  page: Page<T> | T[],
  limit: number,
): string | undefined {
  if (isPage(page)) return page.hasMore ? (page.nextCursor ?? undefined) : undefined;

  if (page.length < limit) return undefined;
  const last = page[page.length - 1];
  return last === undefined ? undefined : String(last.id);
}

/** Builds the query object for a cursor request, omitting the cursor on page one. */
export function cursorParams(cursor: string | undefined, limit: number): CursorParams {
  return cursor === undefined ? { limit } : { cursor, limit };
}
