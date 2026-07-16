import { http } from "@/lib/axios";
import type { CursorParams } from "@/lib/cursor";
import type { CloseFriendDto, OkMessageDto } from "@/types/api.types";

/**
 * Swagger tag: close-friends (3 endpoints).
 *
 * The green ring. A story posted with `closeFriendsOnly` is visible only to this
 * list — softclub had no such concept, so Phase 6 could not offer it.
 *
 * Add is idempotent: adding someone twice is not an error.
 */
export const closeFriendsService = {
  getCloseFriends: (params: CursorParams) => http.get<CloseFriendDto[]>("/close-friends", params),

  add: (userId: string) => http.post<OkMessageDto>(`/close-friends/${userId}`),

  remove: (userId: string) => http.delete<OkMessageDto>(`/close-friends/${userId}`),
};
