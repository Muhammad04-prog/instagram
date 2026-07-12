"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { userProfileService } from "@/services/userProfile.service";

export function useMyProfile() {
  return useQuery({
    queryKey: queryKeys.profile.me(),
    queryFn: () => userProfileService.getMyProfile(),
    staleTime: 5 * 60 * 1000,
  });
}
