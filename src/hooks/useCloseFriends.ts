"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useApiError } from "@/hooks/useApiError";
import { PAGE_SIZE } from "@/lib/constants";
import { cursorParams, nextCursor } from "@/lib/cursor";
import { queryKeys } from "@/lib/query-keys";
import { closeFriendsService } from "@/services/closeFriends.service";

export function useCloseFriends(enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.closeFriends.list(),
    queryFn: ({ pageParam }) =>
      closeFriendsService.getCloseFriends(cursorParams(pageParam, PAGE_SIZE)),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => nextCursor(lastPage, PAGE_SIZE),
    enabled,
  });
}

/**
 * Add / remove, optimistic.
 *
 * IG never announces this — the person is not told either way — so the toggle
 * must feel instant and silent. Only a failure is worth a word.
 */
export function useToggleCloseFriend() {
  const queryClient = useQueryClient();
  const toMessage = useApiError();
  const t = useTranslations("story");

  return useMutation({
    mutationFn: ({ userId, add }: { userId: string; add: boolean }) =>
      add ? closeFriendsService.add(userId) : closeFriendsService.remove(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.closeFriends.all });
      // The green ring on the rail depends on the list.
      void queryClient.invalidateQueries({ queryKey: queryKeys.stories.rail() });
    },
    onError: (error) => toast.error(toMessage(error) || t("closeFriendsError")),
  });
}
