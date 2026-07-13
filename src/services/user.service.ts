import { http } from "@/lib/axios";
import type { GetUsersParams, SearchHistory, User, UserSearchHistory } from "@/types/user.types";

/**
 * Swagger tag: User (10 endpoints).
 *
 * Swagger declares no response schema for any of these — every shape below was
 * read off the live API and is recorded in docs/API_REAL_DTO.md.
 */
export const userService = {
  /** `UserName` is a substring match and also matches fullName ("er" → "america"). */
  getUsers: (params: GetUsersParams = {}) =>
    http.get<User[]>("/User/get-users", {
      UserName: params.userName,
      Email: params.email,
      PageNumber: params.pageNumber,
      PageSize: params.pageSize,
    }),

  /** Empty `Text` → 400. Duplicates are de-duplicated server-side. */
  addSearchHistory: (text: string) =>
    http.post<boolean>("/User/add-search-history", undefined, { Text: text }),

  getSearchHistories: () => http.get<SearchHistory[]>("/User/get-search-histories"),

  /** Unknown id → 404 "Search history not found!". */
  deleteSearchHistory: (id: number) => http.delete<boolean>("/User/delete-search-history", { id }),

  deleteSearchHistories: () => http.delete<boolean>("/User/delete-search-histories"),

  addUserSearchHistory: (userSearchId: string) =>
    http.post<boolean>("/User/add-user-search-history", undefined, {
      UserSearchId: userSearchId,
    }),

  getUserSearchHistories: () => http.get<UserSearchHistory[]>("/User/get-user-search-histories"),

  deleteUserSearchHistory: (id: number) =>
    http.delete<boolean>("/User/delete-user-search-history", { id }),

  deleteUserSearchHistories: () => http.delete<boolean>("/User/delete-user-search-histories"),

  /**
   * ⚠️ Admin-only: answers **403 for every caller**, including a user deleting
   * their own account (verified on throwaway accounts). See docs/BACKEND_BUGS.md #7.
   */
  deleteUser: (userId: string) => http.delete<boolean>("/User/delete-user", { userId }),
};
