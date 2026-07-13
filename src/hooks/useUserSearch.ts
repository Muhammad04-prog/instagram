"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { userService } from "@/services/user.service";
import type { GetUsersParams, SearchHistory, UserSearchHistory } from "@/types/user.types";

export function useUsers(params: GetUsersParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => userService.getUsers(params),
    enabled,
  });
}

export function useSearchHistories() {
  return useQuery({
    queryKey: queryKeys.users.searchHistories(),
    queryFn: () => userService.getSearchHistories(),
  });
}

export function useUserSearchHistories() {
  return useQuery({
    queryKey: queryKeys.users.userSearchHistories(),
    queryFn: () => userService.getUserSearchHistories(),
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
    mutationFn: (text: string) => userService.addSearchHistory(text),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.searchHistories() }),
  });
}

/** Records a visited profile (`UserSearchId` = the user's id). */
export function useAddUserSearchHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userService.addUserSearchHistory(userId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.users.userSearchHistories() }),
  });
}

/** Removes one "Recent" row optimistically, restoring it if the server refuses. */
export function useDeleteSearchHistory() {
  const queryClient = useQueryClient();
  const key = queryKeys.users.searchHistories();

  return useMutation({
    mutationFn: (id: number) => userService.deleteSearchHistory(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<SearchHistory[]>(key);
      queryClient.setQueryData<SearchHistory[]>(key, (rows) =>
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
  const key = queryKeys.users.userSearchHistories();

  return useMutation({
    mutationFn: (id: number) => userService.deleteUserSearchHistory(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<UserSearchHistory[]>(key);
      queryClient.setQueryData<UserSearchHistory[]>(key, (rows) =>
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
      await Promise.all([
        userService.deleteSearchHistories(),
        userService.deleteUserSearchHistories(),
      ]);
    },
    onSuccess: () => {
      queryClient.setQueryData<SearchHistory[]>(queryKeys.users.searchHistories(), []);
      queryClient.setQueryData<UserSearchHistory[]>(queryKeys.users.userSearchHistories(), []);
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
