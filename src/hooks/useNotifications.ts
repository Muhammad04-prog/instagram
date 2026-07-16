"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NOTIFICATIONS_PAGE_SIZE, PAGE_SIZE, UNREAD_POLL_MS } from "@/lib/constants";
import { cursorParams, nextCursor } from "@/lib/cursor";
import { queryKeys } from "@/lib/query-keys";
import { notificationService } from "@/services/notification.service";

export function useNotifications(enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: ({ pageParam }) =>
      notificationService.getNotifications(cursorParams(pageParam, NOTIFICATIONS_PAGE_SIZE)),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => nextCursor(lastPage, NOTIFICATIONS_PAGE_SIZE),
    enabled,
  });
}

/**
 * The red dot on the heart.
 *
 * Polled rather than pushed: the backend has a socket, but wiring it is Phase 17
 * — until then a cheap count every 30s is honest and costs one small request.
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: UNREAD_POLL_MS,
    // A stale badge on tab-focus is worse than one extra request.
    refetchOnWindowFocus: true,
  });
}

export function useProfileViews(enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.notifications.profileViews(),
    queryFn: ({ pageParam }) =>
      notificationService.getProfileViews(cursorParams(pageParam, PAGE_SIZE)),
    initialPageParam: undefined as string | undefined,
    // ⚠️ ProfileViewDto has no id of its own, and the cursor IS the last row's
    // id — so there is nothing to page with. One page, honestly.
    getNextPageParam: () => undefined,
    enabled,
  });
}

/** Marking one row read marks its whole group — the server owns `groupIds`. */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notificationService.markRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      // The count is known to be zero now; don't make the badge wait for a refetch.
      queryClient.setQueryData(queryKeys.notifications.unreadCount(), { count: 0 });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}
