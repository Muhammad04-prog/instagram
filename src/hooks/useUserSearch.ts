"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { userService } from "@/services/user.service";
import type { GetUsersParams } from "@/types/user.types";

export function useUsers(params: GetUsersParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => userService.getUsers(params),
    enabled,
  });
}
