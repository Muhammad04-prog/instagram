"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { type ApiError } from "@/lib/axios";
import { queryKeys } from "@/lib/query-keys";
import { followService } from "@/services/followingRelationShip.service";
import type { FollowableUserProfile, UserProfile } from "@/types/profile.types";

export function useSubscribers(userId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.follow.subscribers(userId),
    queryFn: () => followService.getSubscribers(userId),
    enabled: enabled && Boolean(userId),
  });
}

export function useSubscriptions(userId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.follow.subscriptions(userId),
    queryFn: () => followService.getSubscriptions(userId),
    enabled: enabled && Boolean(userId),
  });
}

/**
 * Follow / unfollow with an optimistic flip of the target's cached profile
 * (`isSubscriber` + `subscribersCount`) and of my own `subscriptionsCount`.
 * Both are rolled back if the request fails.
 *
 * The endpoints answer `{ data: false, errors: ["success followed"] }` — `data`
 * carries no meaning, so success is simply "the promise resolved" (axios only
 * throws on statusCode >= 400).
 */
export function useToggleFollow(userId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (next: boolean) =>
      next ? followService.follow(userId) : followService.unfollow(userId),

    onMutate: async (next: boolean) => {
      const targetKey = queryKeys.profile.byId(userId);
      const myKey = queryKeys.profile.me();

      await Promise.all([
        queryClient.cancelQueries({ queryKey: targetKey }),
        queryClient.cancelQueries({ queryKey: myKey }),
      ]);

      const previousTarget = queryClient.getQueryData<FollowableUserProfile>(targetKey);
      const previousMe = queryClient.getQueryData<UserProfile>(myKey);
      const delta = next ? 1 : -1;

      if (previousTarget) {
        queryClient.setQueryData<FollowableUserProfile>(targetKey, {
          ...previousTarget,
          isSubscriber: next,
          subscribersCount: Math.max(0, previousTarget.subscribersCount + delta),
        });
      }

      if (previousMe) {
        queryClient.setQueryData<UserProfile>(myKey, {
          ...previousMe,
          subscriptionsCount: Math.max(0, previousMe.subscriptionsCount + delta),
        });
      }

      return { previousTarget, previousMe };
    },

    onError: (error: ApiError, _next, context) => {
      if (context?.previousTarget) {
        queryClient.setQueryData(queryKeys.profile.byId(userId), context.previousTarget);
      }
      if (context?.previousMe) {
        queryClient.setQueryData(queryKeys.profile.me(), context.previousMe);
      }
      toast.error(error.message || t("network"));
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.follow.all });
    },
  });
}
