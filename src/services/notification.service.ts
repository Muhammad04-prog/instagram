import { http } from "@/lib/axios";
import type { CursorParams } from "@/lib/cursor";
import type { NotificationDto, OkDto, ProfileViewDto, UnreadCountDto } from "@/types/api.types";

/**
 * Swagger tag: notifications (5 endpoints).
 *
 * The screens for these (img26–img28) sat empty for ten phases: softclub had no
 * notification endpoint at all, so Phase 3 built the panel and had to admit it
 * could never have data.
 *
 * The server groups for us — a row is the *latest* notification of its group,
 * with `othersCount` and `groupIds` — so the client never de-duplicates.
 */
export const notificationService = {
  getNotifications: (params: CursorParams) => http.get<NotificationDto[]>("/notifications", params),

  getUnreadCount: () => http.get<UnreadCountDto>("/notifications/unread-count"),

  /** Marks the whole group read, not just the row. */
  markRead: (id: number) => http.post<OkDto>(`/notifications/${id}/read`),

  markAllRead: () => http.post<OkDto>("/notifications/read-all"),

  /** "Who viewed your profile". */
  getProfileViews: (params: CursorParams) =>
    http.get<ProfileViewDto[]>("/notifications/profile-views", params),
};
