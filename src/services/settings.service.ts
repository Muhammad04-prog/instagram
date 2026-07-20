import { http } from "@/lib/axios";
import type {
  RestrictActionDto,
  SettingsDto,
  UpdateSettingsDto,
  UserBriefDto,
} from "@/types/api.types";

/**
 * Swagger tag: settings (5 endpoints) — new in the 19.07.2026 swagger refresh.
 *
 * `SettingsDto` backs several screens that used to be pure local `useState`
 * mocks with every control disabled (`TagsMentionsSettings`, `SharingSettings`,
 * `CommentsSettings`, the notifications/messages settings pages): see each
 * component for which fields it wired up and which ones still have no
 * backend field at all (e.g. "who sees my online status").
 */
export const settingsService = {
  getSettings: () => http.get<SettingsDto>("/settings"),

  /** Any subset of fields — a partial patch, not a full replacement. */
  updateSettings: (dto: UpdateSettingsDto) => http.put<SettingsDto>("/settings", dto),

  getRestricted: () => http.get<UserBriefDto[]>("/settings/restricted"),

  restrict: (userId: string) => http.post<RestrictActionDto>(`/settings/restricted/${userId}`),

  unrestrict: (userId: string) => http.delete<RestrictActionDto>(`/settings/restricted/${userId}`),
};
