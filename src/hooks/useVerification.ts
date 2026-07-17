"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiError } from "@/hooks/useApiError";
import { queryKeys } from "@/lib/query-keys";
import { verificationService } from "@/services/verification.service";

export function useVerificationStatus() {
  return useQuery({
    queryKey: queryKeys.verification.status(),
    queryFn: () => verificationService.getStatus(),
  });
}

/**
 * Start trial / subscribe / cancel all answer the fresh status, so the screen
 * settles on the server's word rather than guessing what changed.
 *
 * They also move the blue tick, which rides on every profile and user row —
 * hence the wide invalidation.
 */
export function useVerificationAction() {
  const queryClient = useQueryClient();
  const toMessage = useApiError();

  return useMutation({
    mutationFn: (action: "trial" | "subscribe" | "cancel") =>
      action === "trial"
        ? verificationService.startTrial()
        : action === "subscribe"
          ? verificationService.subscribe()
          : verificationService.cancel(),
    onSuccess: (status) => {
      queryClient.setQueryData(queryKeys.verification.status(), status);
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
    },
    onError: (error) => toast.error(toMessage(error)),
  });
}
