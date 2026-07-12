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

/** /User/get-search-histories — free-text search history. */
export interface SearchHistory {
  id: number;
  text: string;
  userId: string;
}

/** /User/get-user-search-histories — visited-profile history. */
export interface UserSearchHistory {
  id: number;
  userId: string;
  userName: string;
  fullName: string | null;
  userImage: string | null;
}
