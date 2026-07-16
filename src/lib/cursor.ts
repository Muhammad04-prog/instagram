/**
 * Cursor pagination.
 *
 * Every list on this backend takes `?cursor=&limit=` and answers with a **bare
 * array** — there is no `{ items, nextCursor }` envelope. Swagger spells the
 * contract out on `GET /users`: the cursor is "курсор последнего элемента
 * предыдущей страницы", i.e. the id of the last row you already have.
 *
 * So the next cursor is derived here, from the tail of the page. A short page
 * means the end of the list.
 */

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

/**
 * `getNextPageParam` for TanStack Query's `useInfiniteQuery`.
 *
 * Returns `undefined` — which stops paging — when the page came back shorter
 * than requested, since only a full page can be followed by another one.
 */
export function nextCursor<T extends Cursorable>(page: T[], limit: number): string | undefined {
  if (page.length < limit) return undefined;

  const last = page[page.length - 1];
  return last === undefined ? undefined : String(last.id);
}

/** Builds the query object for a cursor request, omitting the cursor on page one. */
export function cursorParams(cursor: string | undefined, limit: number): CursorParams {
  return cursor === undefined ? { limit } : { cursor, limit };
}
