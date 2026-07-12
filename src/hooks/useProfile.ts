"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { type ApiError } from "@/lib/axios";
import { PAGE_SIZE } from "@/lib/constants";
import { queryKeys } from "@/lib/query-keys";
import { userProfileService } from "@/services/userProfile.service";
import type { UpdateProfileDto } from "@/types/profile.types";

export function useMyProfile() {
  return useQuery({
    queryKey: queryKeys.profile.me(),
    queryFn: () => userProfileService.getMyProfile(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Someone else's profile. `get-is-follow-user-profile-by-id` returns the profile
 * *and* `isSubscriber`, so this single request feeds both the header and the
 * follow button — no separate is-following call is needed.
 */
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: queryKeys.profile.byId(userId),
    queryFn: () => userProfileService.getIsFollowProfile(userId),
    enabled: Boolean(userId),
    placeholderData: keepPreviousData,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (dto: UpdateProfileDto) => userProfileService.updateProfile(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.profile.all }),
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (file: File) => userProfileService.updateImage(file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.profile.all }),
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}

export function useDeleteAvatar() {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: () => userProfileService.deleteImage(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.profile.all }),
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}

/**
 * Saved posts. The endpoint's pagination envelope is stripped by the axios
 * interceptor, so a short page is what tells us we have reached the end.
 */
export function useFavorites() {
  return useInfiniteQuery({
    queryKey: queryKeys.profile.favorites(),
    queryFn: ({ pageParam }) =>
      userProfileService.getFavorites({ pageNumber: pageParam, pageSize: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length + 1,
  });
}
