"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { type ApiError } from "@/lib/axios";
import { PAGE_SIZE } from "@/lib/constants";
import { cursorParams, nextCursor } from "@/lib/cursor";
import { queryKeys } from "@/lib/query-keys";
import { followService } from "@/services/follow.service";
import type { OtherProfileDto, ProfileDto } from "@/types/api.types";

export function useFollowers(userId: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.follow.followers(userId),
    queryFn: ({ pageParam }) =>
      followService.getFollowers(userId, cursorParams(pageParam, PAGE_SIZE)),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => nextCursor(lastPage, PAGE_SIZE),
    enabled: enabled && Boolean(userId),
  });
}

export function useFollowing(userId: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.follow.following(userId),
    queryFn: ({ pageParam }) =>
      followService.getFollowing(userId, cursorParams(pageParam, PAGE_SIZE)),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => nextCursor(lastPage, PAGE_SIZE),
    enabled: enabled && Boolean(userId),
  });
}

/**
 * Follow / unfollow, optimistic on both sides of the relationship: the target's
 * `isFollowing` + `followersCount`, and my own `followingCount`.
 *
 * Following a **private** account creates a request instead of a follow, so the
 * optimistic flip is deliberately conservative — it does not bump the follower
 * count for a private target, and `onSuccess` reconciles with what the server
 * actually did (`isFollowing` vs `hasRequestPending`).
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

      const previousTarget = queryClient.getQueryData<OtherProfileDto>(targetKey);
      const previousMe = queryClient.getQueryData<ProfileDto>(myKey);

      if (previousTarget) {
        const becomesRequest = next && previousTarget.isPrivate;
        const delta = becomesRequest ? 0 : next ? 1 : -1;

        queryClient.setQueryData<OtherProfileDto>(targetKey, {
          ...previousTarget,
          isFollowing: becomesRequest ? false : next,
          hasRequestPending: becomesRequest,
          followersCount: Math.max(0, previousTarget.followersCount + delta),
        });
      }

      if (previousMe && !previousTarget?.isPrivate) {
        queryClient.setQueryData<ProfileDto>(myKey, {
          ...previousMe,
          followingCount: Math.max(0, previousMe.followingCount + (next ? 1 : -1)),
        });
      }

      return { previousTarget, previousMe };
    },

    onSuccess: (result) => {
      // The server is the authority on follow-vs-request.
      queryClient.setQueryData<OtherProfileDto>(queryKeys.profile.byId(userId), (current) =>
        current
          ? {
              ...current,
              isFollowing: result.isFollowing,
              hasRequestPending: result.hasRequestPending,
            }
          : current,
      );
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
