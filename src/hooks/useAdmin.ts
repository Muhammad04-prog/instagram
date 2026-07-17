"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiError } from "@/hooks/useApiError";
import { PAGE_SIZE } from "@/lib/constants";
import { cursorParams, nextCursor } from "@/lib/cursor";
import { queryKeys } from "@/lib/query-keys";
import { adminService } from "@/services/admin.service";

export function useAdminUsers(q: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.admin.users(q),
    queryFn: ({ pageParam }) =>
      adminService.getUsers({ ...cursorParams(pageParam, PAGE_SIZE), ...(q ? { q } : {}) }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => nextCursor(lastPage, PAGE_SIZE),
  });
}

export function useAdminReports(filter: "open" | "resolved") {
  return useInfiniteQuery({
    queryKey: queryKeys.admin.reports(filter),
    queryFn: ({ pageParam }) =>
      adminService.getReports({ ...cursorParams(pageParam, PAGE_SIZE), filter }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => nextCursor(lastPage, PAGE_SIZE),
  });
}

/** Soft delete: the row survives with `isDeleted`, so the list still shows it. */
export function useAdminDeleteUser(q: string) {
  const queryClient = useQueryClient();
  const toMessage = useApiError();

  return useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.users(q) }),
    onError: (error) => toast.error(toMessage(error)),
  });
}

/** Resolving moves the report between the two tabs, so both are invalidated. */
export function useResolveReport() {
  const queryClient = useQueryClient();
  const toMessage = useApiError();

  return useMutation({
    mutationFn: (id: string) => adminService.resolveReport(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.all }),
    onError: (error) => toast.error(toMessage(error)),
  });
}
