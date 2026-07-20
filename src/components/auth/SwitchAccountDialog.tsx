"use client";

import { useTranslations } from "next-intl";
import { InstagramWordmark } from "@/components/icons/InstagramLogo";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { useSavedAccountsStore, type SavedAccount } from "@/store/savedAccounts.store";

/**
 * «Переключиться» (docs/screenshots/img8) — the profiles this browser has signed
 * in with, plus a way to reach the login form for a new one.
 *
 * ⚠️ This is not multi-session. The token lives in a single httpOnly cookie, so
 * two accounts cannot be signed in at once: picking one bumps it to the front of
 * the saved list and logs out, landing on /login with «Continue as …» already
 * showing that profile. Same contract `MoreMenu` has used all along — the
 * password step is one click away rather than a blank form.
 */
export function SwitchAccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("nav");
  const tAuth = useTranslations("auth");
  const tFeed = useTranslations("feed");
  const router = useRouter();
  const { user, logout } = useAuth();
  const savedAccounts = useSavedAccountsStore((s) => s.accounts);
  const remember = useSavedAccountsStore((s) => s.remember);

  const otherAccounts = savedAccounts.filter((account) => account.userId !== user?.id);

  const switchTo = (account: SavedAccount) => {
    remember(account);
    onOpenChange(false);
    void logout();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-ig-elevated w-[400px] max-w-[95vw] gap-0 rounded-xl p-0 sm:max-w-[400px]">
        <DialogTitle className="sr-only">{t("switchAccounts")}</DialogTitle>

        <div className="text-ig-text flex justify-center pt-9 pb-7">
          <InstagramWordmark className="h-12 w-auto" />
        </div>

        {otherAccounts.length > 0 ? (
          <ul className="px-2 pb-2">
            {otherAccounts.map((account) => (
              <li key={account.userId}>
                <button
                  type="button"
                  onClick={() => switchTo(account)}
                  className="hover:bg-ig-bg-secondary flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors"
                >
                  <UserAvatar src={account.image} alt={account.userName} size={44} />
                  <span className="text-ig-text min-w-0 flex-1 truncate text-sm font-semibold">
                    {account.userName}
                  </span>
                  <span className="text-ig-primary shrink-0 text-xs font-semibold">
                    {tFeed("switch")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ig-text-secondary px-8 pb-4 text-center text-sm">
            {t("noOtherAccounts")}
          </p>
        )}

        <div className="border-ig-separator border-t px-6 py-4">
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              router.push(ROUTES.login);
            }}
            className="text-ig-primary w-full text-center text-sm font-semibold hover:opacity-70"
          >
            {tAuth("useAnotherProfile")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
