"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { ApiError } from "@/lib/axios";
import { queryKeys } from "@/lib/query-keys";
import { locationService } from "@/services/location.service";
import type { AddLocationDto, GetLocationsParams, UpdateLocationDto } from "@/types/location.types";

export function useLocations(params: GetLocationsParams = {}) {
  return useQuery({
    queryKey: queryKeys.locations.list(params),
    queryFn: () => locationService.getLocations(params),
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
    (dto: AddLocationDto) => locationService.addLocation(dto),
    "locationAdded",
  );
}

/** Always fails today — the server's mapper is broken (BACKEND_BUGS #19). */
export function useUpdateLocation() {
  return useLocationMutation(
    (dto: UpdateLocationDto) => locationService.updateLocation(dto),
    "locationUpdated",
  );
}

export function useDeleteLocation() {
  return useLocationMutation((id: number) => locationService.deleteLocation(id), "locationDeleted");
}
