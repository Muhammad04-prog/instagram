import { http } from "@/lib/axios";
import type { GetUsersParams, User } from "@/types/user.types";

/** Swagger tag: User. Search history endpoints land in Phase 8. */
export const userService = {
  getUsers: (params: GetUsersParams = {}) =>
    http.get<User[]>("/User/get-users", {
      UserName: params.userName,
      Email: params.email,
      PageNumber: params.pageNumber,
      PageSize: params.pageSize,
    }),
};
