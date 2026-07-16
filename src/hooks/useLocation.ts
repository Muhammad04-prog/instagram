"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { ApiError } from "@/lib/axios";
import { PAGE_SIZE } from "@/lib/constants";
import { queryKeys } from "@/lib/query-keys";
import { locationService } from "@/services/location.service";
import type { CreateLocationDto, UpdateLocationDto } from "@/types/api.types";

export function useLocations(q = "") {
  return useQuery({
    queryKey: queryKeys.locations.list(q),
    queryFn: () => locationService.getLocations({ q: q || undefined, limit: PAGE_SIZE }),
  });
}

export function useLocation(id: number) {
  return useQuery({
    queryKey: queryKeys.locations.detail(id),
    queryFn: () => locationService.getLocationById(id),
    enabled: id > 0,
  });
}

function useLocationMutation<TVars>(
  fn: (vars: TVars) => Promise<unknown>,
  successKey: "locationAdded" | "locationUpdated" | "locationDeleted",
) {
  const queryClient = useQueryClient();
  const t = useTranslations("locations");
  const tErrors = useTranslations("errors");

  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      toast.success(t(successKey));
      void queryClient.invalidateQueries({ queryKey: queryKeys.locations.all });
    },
    onError: (error: ApiError) => toast.error(error.message || tErrors("network")),
  });
}

export function useAddLocation() {
  return useLocationMutation(
    (dto: CreateLocationDto) => locationService.create(dto),
    "locationAdded",
  );
}

/**
 * Works now. Softclub's update answered 400 "Missing type map configuration"
 * to every call — an AutoMapper misconfiguration on their side (bug #19).
 */
export function useUpdateLocation() {
  return useLocationMutation(
    ({ id, dto }: { id: number; dto: UpdateLocationDto }) => locationService.update(id, dto),
    "locationUpdated",
  );
}

export function useDeleteLocation() {
  return useLocationMutation((id: number) => locationService.remove(id), "locationDeleted");
}
