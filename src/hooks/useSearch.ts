"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { searchService } from "@/services/search.service";

/**
 * Accounts + hashtags + locations in **one** response.
 *
 * Phase 8 could only search accounts (`/User/get-users`) — softclub had no
 * hashtags and no place search at all.
 */
export function useSearch(q: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.search.combined(q),
    queryFn: () => searchService.search(q),
    enabled: enabled && q.length > 0,
  });
}

/** Trending hashtags + accounts of the week — what an empty search shows. */
export function useSearchTop(enabled = true) {
  return useQuery({
    queryKey: queryKeys.search.top(),
    queryFn: () => searchService.getTop(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
