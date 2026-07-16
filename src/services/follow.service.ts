import { http } from "@/lib/axios";
import type { CursorParams } from "@/lib/cursor";
import type {
  BlockedUserDto,
  FollowerDto,
  FollowRequestDto,
  FollowResultDto,
  OkMessageDto,
} from "@/types/api.types";

/**
 * Swagger tag: follow (11 endpoints).
 *
 * Following a private account creates a *request* rather than a follow — the
 * result says which happened, so the button can read "Requested".
 *
 * Blocking is one-way and destructive: unblocking does NOT restore the follows
 * that existed before, which is worth saying out loud in the confirm dialog.
 */
export const followService = {
  follow: (userId: string) => http.post<FollowResultDto>(`/follow/${userId}`),

  /** Idempotent — un-following someone you never followed is still a 200. */
  unfollow: (userId: string) => http.delete<FollowResultDto>(`/follow/${userId}`),

  getFollowers: (userId: string, params: CursorParams) =>
    http.get<FollowerDto[]>(`/follow/${userId}/followers`, params),

  getFollowing: (userId: string, params: CursorParams) =>
    http.get<FollowerDto[]>(`/follow/${userId}/following`, params),

  /** Removes THEIR follow of me — I stay subscribed to them if I was. */
  removeFollower: (userId: string) => http.delete<OkMessageDto>(`/follow/followers/${userId}`),

  block: (userId: string) => http.post<OkMessageDto>(`/follow/${userId}/block`),

  unblock: (userId: string) => http.delete<OkMessageDto>(`/follow/${userId}/block`),

  getBlocked: (params: CursorParams) => http.get<BlockedUserDto[]>("/follow/blocked", params),

  /** Incoming follow requests — only a private account ever has these. */
  getRequests: (params: CursorParams) => http.get<FollowRequestDto[]>("/follow/requests", params),

  acceptRequest: (id: string) => http.post<OkMessageDto>(`/follow/requests/${id}/accept`),

  declineRequest: (id: string) => http.post<OkMessageDto>(`/follow/requests/${id}/decline`),
};
