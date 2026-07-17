"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { ApiError } from "@/lib/axios";

/** Per-status overrides, e.g. `{ 401: t("invalidCredentials") }`. */
export type StatusMessages = Partial<Record<number, string>>;

/**
 * Turns an ApiError into a sentence a person can act on.
 *
 * The backend documents its failure modes per endpoint — 409 "userName / email /
 * phone уже заняты", 401 "Неверный логин или пароль (401, не 500)", 429 "Больше
 * 5 запросов в минуту" — but the raw payload is not always something to show a
 * user, and axios's own text ("Request failed with status code 429") never is.
 *
 * Statuses common to every endpoint (429, network) are handled here once;
 * anything endpoint-specific is passed in by the caller.
 */
export function useApiError() {
  const t = useTranslations("errors");

  return useCallback(
    (error: unknown, byStatus: StatusMessages = {}): string => {
      const status = error instanceof ApiError ? error.statusCode : 0;

      const specific = byStatus[status];
      if (specific) return specific;

      // Rate limiting is uniform across auth: say to wait, not "Request failed".
      if (status === 429) return t("rateLimited");

      // 0 = never reached the server; 502 = our proxy could not reach upstream.
      // Both are "your connection / the server is unreachable", not a user error.
      if (status === 0 || status === 502) return t("network");

      const message = error instanceof ApiError ? error.message : "";
      return message || t("network");
    },
    [t],
  );
}
