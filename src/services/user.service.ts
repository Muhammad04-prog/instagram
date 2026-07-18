import { http } from "@/lib/axios";
import type { CursorParams, Page } from "@/lib/cursor";
import type {
  AccountDeletedDto,
  AddSearchedUserDto,
  AddSearchTextDto,
  DeletedCountDto,
  ReportCreatedDto,
  ReportUserDto,
  SearchedUserItemDto,
  SearchHistoryItemDto,
  SuggestionDto,
  UserBriefDto,
} from "@/types/api.types";

export interface SearchUsersParams extends CursorParams {
  /** Substring — matches userName AND fullName. */
  q?: string;
}

/**
 * Swagger tag: users (12 endpoints).
 *
 * Search history carries `createdAt` now, so "Recent" can be ordered
 * chronologically — on softclub it had no timestamp and the two history kinds
 * came from different id sequences, so the order had to be faked (bug #14).
 *
 * `DELETE /users/me` is a real soft-delete the owner may call; softclub's
 * `delete-user` was admin-only and answered 403 to everyone (bug #13).
 */
export const userService = {
  search: (params: SearchUsersParams) => http.get<Page<UserBriefDto>>("/users", params),

  /**
   * Exact, case-insensitive userName match — added specifically so @mentions
   * and `/u/{userName}` don't have to fake it out of the substring `search()`
   * results (a blocked user 404s here too, same as in search).
   */
  getByUserName: (userName: string) =>
    http.get<UserBriefDto>(`/users/by-username/${encodeURIComponent(userName)}`),

  getSuggestions: (params: CursorParams) => http.get<SuggestionDto[]>("/users/suggestions", params),

  deleteMe: () => http.delete<AccountDeletedDto>("/users/me"),

  report: (userId: string, dto: ReportUserDto) =>
    http.post<ReportCreatedDto>(`/users/${userId}/report`, dto),

  /** Text query history. */
  addSearchText: (dto: AddSearchTextDto) =>
    http.post<SearchHistoryItemDto>("/users/search-history", dto),

  getSearchTexts: (params: CursorParams) =>
    http.get<SearchHistoryItemDto[]>("/users/search-history", params),

  clearSearchTexts: () => http.delete<DeletedCountDto>("/users/search-history"),

  removeSearchText: (id: string) => http.delete<DeletedCountDto>(`/users/search-history/${id}`),

  /** Visited-profile history. Re-adding an existing entry bumps it to the top. */
  addSearchedUser: (dto: AddSearchedUserDto) =>
    http.post<SearchedUserItemDto>("/users/search-history/user", dto),

  getSearchedUsers: (params: CursorParams) =>
    http.get<SearchedUserItemDto[]>("/users/search-history/users", params),

  clearSearchedUsers: () => http.delete<DeletedCountDto>("/users/search-history/users"),

  removeSearchedUser: (id: string) =>
    http.delete<DeletedCountDto>(`/users/search-history/user/${id}`),
};
