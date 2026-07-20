"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useApiError } from "@/hooks/useApiError";
import { queryKeys } from "@/lib/query-keys";
import { settingsService } from "@/services/settings.service";
import type { UpdateSettingsDto } from "@/types/api.types";

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings.me(),
    queryFn: () => settingsService.getSettings(),
  });
}

/**
 * Any subset of `SettingsDto` — the server answers with the full, current
 * document, so the cache is set directly rather than merely invalidated.
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const toMessage = useApiError();

  return useMutation({
    mutationFn: (dto: UpdateSettingsDto) => settingsService.updateSettings(dto),
    onSuccess: (settings) => queryClient.setQueryData(queryKeys.settings.me(), settings),
    onError: (error) => toast.error(toMessage(error)),
  });
}

/** Not paginated — the server answers the whole list in one array. */
export function useRestrictedAccounts() {
  return useQuery({
    queryKey: queryKeys.settings.restricted(),
    queryFn: () => settingsService.getRestricted(),
  });
}

/**
 * Restrict is IG's quiet middle ground between doing nothing and blocking:
 * the other person is never told either way, so this is optimistic and silent
 * exactly like `useToggleCloseFriend`.
 */
export function useToggleRestricted() {
  const queryClient = useQueryClient();
  const toMessage = useApiError();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: ({ userId, restrict }: { userId: string; restrict: boolean }) =>
      restrict ? settingsService.restrict(userId) : settingsService.unrestrict(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.settings.restricted() }),
    onError: (error) => toast.error(toMessage(error) || t("network")),
  });
}
