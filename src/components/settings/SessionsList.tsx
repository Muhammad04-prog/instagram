"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { useLogoutAllOtherSessions, useRevokeSession, useSessions } from "@/hooks/useSessions";

/**
 * Settings → Where you're logged in — `GET /auth/sessions` (marked via the
 * current refresh token, read server-side only: `app/api/auth/sessions`) and
 * `DELETE /auth/sessions/{id}` / `POST /auth/sessions/logout-all`.
 */
export function SessionsList() {
  const t = useTranslations("settings");
  const format = useFormatter();
  const [confirmAllOpen, setConfirmAllOpen] = useState(false);

  const { data, isPending, isError, refetch } = useSessions();
  const revoke = useRevokeSession();
  const logoutAll = useLogoutAllOtherSessions();

  if (isPending) return <Loader className="py-10" />;
  if (isError || !data) return <ErrorState onRetry={() => void refetch()} />;

  const others = data.filter((session) => !session.current);

  return (
    <div className="max-w-[640px] space-y-6">
      <h2 className="text-ig-text text-lg font-bold">{t("loginActivity")}</h2>
      <p className="text-ig-text-secondary text-sm">{t("sessionsHint")}</p>

      <ul className="space-y-2">
        {data.map((session) => (
          <li
            key={session.id}
            className="border-ig-border flex items-center gap-4 rounded-2xl border px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-ig-text truncate text-sm font-semibold">
                {session.userAgent ?? session.ip ?? session.id}
              </p>
              <p className="text-ig-text-secondary text-xs">
                {session.current
                  ? t("sessionsCurrentDevice")
                  : format.dateTime(new Date(session.createdAt), { dateStyle: "long" })}
              </p>
            </div>

            {session.current ? null : (
              <button
                type="button"
                onClick={() => revoke.mutate(session.id)}
                disabled={revoke.isPending}
                className="bg-ig-button-secondary text-ig-text hover:bg-ig-button-secondary-hover shrink-0 rounded-lg px-4 py-1.5 text-sm font-semibold disabled:opacity-50"
              >
                {t("sessionsLogOut")}
              </button>
            )}
          </li>
        ))}
      </ul>

      {others.length === 0 ? (
        <p className="text-ig-text-secondary text-sm">{t("sessionsEmpty")}</p>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmAllOpen(true)}
          className="text-ig-danger text-sm font-semibold"
        >
          {t("sessionsLogOutAllOthers")}
        </button>
      )}

      <ConfirmDialog
        open={confirmAllOpen}
        onOpenChange={setConfirmAllOpen}
        title={t("sessionsLogOutAllOthers")}
        description={t("sessionsLogOutAllConfirm")}
        confirmLabel={t("sessionsLogOutAllOthers")}
        onConfirm={() =>
          logoutAll.mutate(undefined, {
            onSuccess: (result) =>
              toast.success(t("sessionsLogOutAllDone", { count: result.revoked })),
          })
        }
      />
    </div>
  );
}
