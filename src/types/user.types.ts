/** Shape confirmed against the live API (GET /User/get-users). */
export interface User {
  id: string;
  userName: string;
  fullName: string | null;
  avatar: string | null;
  subscribersCount: number;
}

export interface GetUsersParams {
  userName?: string;
  email?: string;
  pageNumber?: number;
  pageSize?: number;
}

/**
 * /User/get-search-histories — free-text queries. Live API returns exactly
 * `{ id, text }` (no userId), newest first. The server de-duplicates: adding an
 * existing text twice does not create a second row.
 */
export interface SearchHistory {
  id: number;
  text: string;
}

/**
 * /User/get-user-search-histories — visited profiles. The user is **nested**
 * under `users` (not flattened), and `id` is the history row, not the user.
 */
export interface UserSearchHistory {
  id: number;
  users: User;
}
