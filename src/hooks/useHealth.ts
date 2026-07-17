"use client";

import { useQuery } from "@tanstack/react-query";
import { healthService } from "@/services/health.service";

/**
 * Asked only when something has already gone wrong, so an error screen can say
 * which side is broken instead of blaming the person's wifi.
 *
 * `retry: false` on purpose: this is the call that diagnoses a failure, so
 * retrying it would just stack more failures. If it cannot answer either, we
 * learn nothing new and the generic message stands.
 */
export function useHealth(enabled: boolean) {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => healthService.check(),
    enabled,
    retry: false,
    staleTime: 30_000,
  });
}
