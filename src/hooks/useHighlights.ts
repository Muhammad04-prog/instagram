"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiError } from "@/hooks/useApiError";
import { queryKeys } from "@/lib/query-keys";
import { highlightService } from "@/services/highlight.service";
import type { CreateHighlightDto, UpdateHighlightDto } from "@/types/api.types";

export function useUserHighlights(userId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.highlights.byUser(userId),
    queryFn: () => highlightService.getUserHighlights(userId),
    enabled: enabled && Boolean(userId),
  });
}

/** The stories inside one highlight — only fetched when it is opened. */
export function useHighlight(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.highlights.detail(id),
    queryFn: () => highlightService.getHighlight(id),
    enabled: enabled && Boolean(id),
  });
}

export function useCreateHighlight() {
  const queryClient = useQueryClient();
  const toMessage = useApiError();

  return useMutation({
    mutationFn: (dto: CreateHighlightDto) => highlightService.create(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.highlights.all }),
    onError: (error) => toast.error(toMessage(error)),
  });
}

export function useUpdateHighlight() {
  const queryClient = useQueryClient();
  const toMessage = useApiError();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateHighlightDto }) =>
      highlightService.update(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.highlights.all }),
    onError: (error) => toast.error(toMessage(error)),
  });
}

/** Deleting a highlight does NOT delete its stories — the confirm text says so. */
export function useDeleteHighlight() {
  const queryClient = useQueryClient();
  const toMessage = useApiError();

  return useMutation({
    mutationFn: (id: string) => highlightService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.highlights.all }),
    onError: (error) => toast.error(toMessage(error)),
  });
}
