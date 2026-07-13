"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useAuth } from "@/hooks/useAuth";
import type { ApiError } from "@/lib/axios";
import { userService } from "@/services/user.service";

/**
 * `DELETE /User/delete-user` (double-confirm, as IG does for destructive account
 * actions). The two dialogs keep independent open-flags because ConfirmDialog
 * closes itself after onConfirm — a single step counter would be reset by it.
 *
 * ⚠️ The endpoint is admin-only and answers **403 to every caller**, including a
 * user deleting their own account (verified on throwaway accounts —
 * docs/BACKEND_BUGS.md #7). The button therefore stays, but in practice it can
 * only surface the server's refusal in a toast; the account is not deleted.
 */
export function DeleteAccountDialog() {
  const t = useTranslations("settings");
  const tErrors = useTranslations("errors");
  const { user, logout } = useAuth();
  const [askOpen, setAskOpen] = useState(false);
  const [finalOpen, setFinalOpen] = useState(false);

  const deleteAccount = useMutation({
    mutationFn: () => userService.deleteUser(user?.userId ?? ""),
    onSuccess: () => {
      toast.success(t("deleteAccountDone"));
      void logout();
    },
    // 403 is the *expected* answer here — the endpoint is admin-only — so it gets
    // a real sentence instead of axios's "Request failed with status code 403".
    onError: (error: ApiError) =>
      toast.error(
        error.statusCode === 403
          ? t("deleteAccountForbidden")
          : error.message || tErrors("network"),
      ),
  });

  return (
    <>
      <ConfirmDialog
        open={askOpen}
        onOpenChange={setAskOpen}
        trigger={
          <button type="button" className="text-ig-danger text-sm font-semibold">
            {t("deleteAccount")}
          </button>
        }
        title={t("deleteAccount")}
        description={t("deleteAccountConfirm")}
        confirmLabel={t("continue")}
        onConfirm={() => setFinalOpen(true)}
      />

      {/* Second confirmation — the point of no return. */}
      <ConfirmDialog
        open={finalOpen}
        onOpenChange={setFinalOpen}
        title={t("deleteAccountFinalTitle")}
        description={t("deleteAccountFinalDescription")}
        warnDescription
        confirmLabel={t("deleteAccountFinalConfirm")}
        onConfirm={() => deleteAccount.mutate()}
      />
    </>
  );
}
