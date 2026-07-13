"use client";

import { useTranslations } from "next-intl";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useSavedAccountsStore } from "@/store/savedAccounts.store";

/**
 * "Remove profiles from this browser" (docs/screenshots/img3), reached from the
 * gear on the "Continue as …" card. It only clears the local list — the account
 * itself is untouched.
 */
export function RemoveProfilesDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("auth");
  const accounts = useSavedAccountsStore((s) => s.accounts);
  const forget = useSavedAccountsStore((s) => s.forget);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-auth-input-bg w-[440px] rounded-2xl p-6">
        <DialogTitle className="text-ig-text mb-4 text-2xl font-semibold">
          {t("removeProfilesTitle")}
        </DialogTitle>

        <ul className="space-y-2">
          {accounts.map((account) => (
            <li
              key={account.userId}
              className="border-auth-input-border flex items-center gap-3 rounded-2xl border px-4 py-3"
            >
              <UserAvatar src={account.image} size={44} />
              <span className="min-w-0 flex-1">
                <span className="text-ig-text block truncate text-sm font-semibold">
                  {account.userName}
                </span>
                <span className="text-ig-text-secondary block text-sm">Instagram</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  forget(account.userId);
                  if (accounts.length <= 1) onOpenChange(false);
                }}
                className="border-auth-input-border text-ig-text hover:bg-ig-elevated rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors"
              >
                {t("remove")}
              </button>
            </li>
          ))}
        </ul>

        <DialogDescription className="text-ig-text-secondary mt-4 text-sm">
          {t("removeProfilesHint")}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
