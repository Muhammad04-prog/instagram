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
import { cursorParams, nextCursor } from "@/lib/cursor";
import { queryKeys } from "@/lib/query-keys";
import { profileService } from "@/services/profile.service";
import type { UpdatePrivacyDto, UpdateProfileDto } from "@/types/api.types";

export function useMyProfile() {
  return useQuery({
    queryKey: queryKeys.profile.me(),
    queryFn: () => profileService.getMyProfile(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Someone else's profile.
 *
 * `OtherProfileDto` carries the whole relationship — `isFollowing`,
 * `hasRequestPending`, `isBlocked`, `canViewContent` — so this one request feeds
 * the header, the follow button and the private-account gate alike.
 */
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: queryKeys.profile.byId(userId),
    queryFn: () => profileService.getProfileById(userId),
    enabled: Boolean(userId),
    placeholderData: keepPreviousData,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (dto: UpdateProfileDto) => profileService.update(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.profile.all }),
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}

/** Private-account switch. Flipping it back to public auto-accepts nothing — pending requests stay pending. */
export function useUpdatePrivacy() {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (dto: UpdatePrivacyDto) => profileService.setPrivacy(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.profile.all }),
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (file: File) => profileService.uploadAvatar(file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.profile.all }),
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}

/**
 * Deleting the avatar is safe here. On softclub it set `image` to null and then
 * broke login with a 500 for that account (bug #4) — this backend just clears it.
 */
export function useDeleteAvatar() {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: () => profileService.deleteAvatar(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.profile.all }),
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}

/** Saved posts — only ever your own. */
export function useFavorites() {
  return useInfiniteQuery({
    queryKey: queryKeys.profile.favorites(),
    queryFn: ({ pageParam }) => profileService.getFavorites(cursorParams(pageParam, PAGE_SIZE)),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => nextCursor(lastPage, PAGE_SIZE),
  });
}

export function useMyReposts() {
  return useInfiniteQuery({
    queryKey: queryKeys.profile.reposts(),
    queryFn: ({ pageParam }) => profileService.getMyReposts(cursorParams(pageParam, PAGE_SIZE)),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => nextCursor(lastPage, PAGE_SIZE),
  });
}
