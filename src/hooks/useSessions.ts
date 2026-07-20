"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useApiError } from "@/hooks/useApiError";
import { queryKeys } from "@/lib/query-keys";
import { authService, sessionsService } from "@/services/auth.service";

export function useSessions() {
  return useQuery({
    queryKey: queryKeys.auth.sessions(),
    queryFn: () => sessionsService.list(),
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  const toMessage = useApiError();

  return useMutation({
    mutationFn: (id: string) => authService.revokeSession(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.auth.sessions() }),
    onError: (error) => toast.error(toMessage(error)),
  });
}

export function useLogoutAllOtherSessions() {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: () => sessionsService.logoutAllOthers(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.auth.sessions() }),
    onError: () => toast.error(t("network")),
  });
}
