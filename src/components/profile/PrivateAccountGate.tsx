import { LockIcon } from "@/components/icons";
import { useTranslations } from "next-intl";

/**
 * Shown instead of the grid when a private account has not accepted me.
 *
 * `canViewContent` on the profile is what decides this — the posts/reels/tagged
 * endpoints answer **403** for a locked account, and that 403 is the product
 * behaviour, not a failure. It must never surface as "Something went wrong".
 */
export function PrivateAccountGate() {
  const t = useTranslations("profile");

  return (
    <div className="border-ig-separator flex flex-col items-center border-t px-6 py-16 text-center">
      <span className="border-ig-text flex size-12 items-center justify-center rounded-full border-2">
        <LockIcon className="text-ig-text size-6" />
      </span>
      <h2 className="text-ig-text mt-4 text-base font-semibold">{t("privateTitle")}</h2>
      <p className="text-ig-text-secondary mt-1 max-w-sm text-sm">{t("privateDescription")}</p>
    </div>
  );
}
