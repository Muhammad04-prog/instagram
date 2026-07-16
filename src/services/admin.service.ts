import { http } from "@/lib/axios";
import type { CursorParams } from "@/lib/cursor";
import type { AdminOkDto, AdminReportDto, AdminUserDto } from "@/types/api.types";

export interface AdminUsersParams extends CursorParams {
  q?: string;
}

export interface AdminReportsParams extends CursorParams {
  /** `open` | `resolved`. */
  filter?: string;
}

/**
 * Swagger tag: admin (4 endpoints). Every one is ADMIN-only.
 *
 * The guard is the server's; the UI hides the screen from non-admins purely so
 * nobody is shown a door that answers 403 — `role` on the session says which.
 *
 * All the "report" buttons across the app (post / user / chat) land here.
 */
export const adminService = {
  getUsers: (params: AdminUsersParams) => http.get<AdminUserDto[]>("/admin/users", params),

  /** Soft delete — the row stays with `isDeleted`. */
  deleteUser: (id: string) => http.delete<AdminOkDto>(`/admin/users/${id}`),

  getReports: (params: AdminReportsParams) => http.get<AdminReportDto[]>("/admin/reports", params),

  resolveReport: (id: string) => http.post<AdminOkDto>(`/admin/reports/${id}/resolve`),
};
