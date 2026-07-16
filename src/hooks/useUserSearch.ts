"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SEARCH_PAGE_SIZE } from "@/lib/constants";
import { MAX_LIMIT } from "@/lib/cursor";
import { queryKeys } from "@/lib/query-keys";
import { userService } from "@/services/user.service";
import type { SearchedUserItemDto, SearchHistoryItemDto } from "@/types/api.types";

/** `q` is a substring and matches fullName too ("er" → "eraj", "america"). */
export function useUsers(q: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.users.search(q),
    queryFn: () => userService.search({ q, limit: SEARCH_PAGE_SIZE }),
    enabled: enabled && q.length > 0,
  });
}

export function useSuggestions() {
  return useQuery({
    queryKey: queryKeys.users.suggestions(),
    queryFn: () => userService.getSuggestions({ limit: SEARCH_PAGE_SIZE }),
  });
}

/**
 * "Recent" — both histories carry `createdAt` now, so the order is real.
 * Phase 8 had to invent one: softclub gave no timestamps and the two kinds came
 * from different id sequences (bug #14).
 */
export function useSearchHistories() {
  return useQuery({
    queryKey: queryKeys.users.searchTexts(),
    queryFn: () => userService.getSearchTexts({ limit: MAX_LIMIT }),
  });
}

export function useUserSearchHistories() {
  return useQuery({
    queryKey: queryKeys.users.searchedUsers(),
    queryFn: () => userService.getSearchedUsers({ limit: MAX_LIMIT }),
  });
}

/**
 * Records a typed query. Called when the search is *committed* (Enter, or
 * clicking a result) — not on every keystroke, which would fill "Recent" with
 * every prefix the user typed through ("e", "er", "era", …).
 */
export function useAddSearchHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => userService.addSearchText({ text }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.searchTexts() }),
  });
}

/** Records a visited profile. Re-adding an existing entry bumps it to the top. */
export function useAddUserSearchHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userService.addSearchedUser({ searchedUserId: userId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.searchedUsers() }),
  });
}

/** Removes one "Recent" row optimistically, restoring it if the server refuses. */
export function useDeleteSearchHistory() {
  const queryClient = useQueryClient();
  const key = queryKeys.users.searchTexts();

  return useMutation({
    mutationFn: (id: string) => userService.removeSearchText(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<SearchHistoryItemDto[]>(key);
      queryClient.setQueryData<SearchHistoryItemDto[]>(key, (rows) =>
        rows?.filter((row) => row.id !== id),
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteUserSearchHistory() {
  const queryClient = useQueryClient();
  const key = queryKeys.users.searchedUsers();

  return useMutation({
    mutationFn: (id: string) => userService.removeSearchedUser(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<SearchedUserItemDto[]>(key);
      queryClient.setQueryData<SearchedUserItemDto[]>(key, (rows) =>
        rows?.filter((row) => row.id !== id),
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

/** "Clear all" wipes both histories — the panel shows them as one list. */
export function useClearSearchHistories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await Promise.all([userService.clearSearchTexts(), userService.clearSearchedUsers()]);
    },
    onSuccess: () => {
      queryClient.setQueryData<SearchHistoryItemDto[]>(queryKeys.users.searchTexts(), []);
      queryClient.setQueryData<SearchedUserItemDto[]>(queryKeys.users.searchedUsers(), []);
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
