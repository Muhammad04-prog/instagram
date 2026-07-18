"use client";

import { CircleCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useMyProfile } from "@/hooks/useProfile";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";

/** Settings → Статус аккаунта. Header card is real (own avatar/username);
 * the three rows below have no backing endpoint, so they all lead to the
 * same generic "no actions" screen (img: "Действия" / "Нет действий"). */
export function AccountStatusScreen() {
  const t = useTranslations("settings");
  const { data: profile, isPending, isError, refetch } = useMyProfile();

  if (isPending) return <Loader className="py-10" />;
  if (isError || !profile) return <ErrorState onRetry={() => void refetch()} />;

  const rows = [
    { key: "deletedContentRow" },
    { key: "under18Row" },
    { key: "unavailableFeaturesRow" },
  ] as const;

  return (
    <div className="max-w-[640px] space-y-6">
      <h2 className="text-ig-text text-lg font-bold">{t("accountStatus")}</h2>

      <div className="bg-ig-bg-secondary flex items-center gap-3 rounded-2xl px-4 py-4">
        <UserAvatar src={profile.avatarUrl ?? null} alt={profile.userName} size={44} />
        <span className="text-ig-text text-sm font-semibold">{profile.userName}</span>
      </div>

      <p className="text-ig-text-secondary text-sm">
        {t("accountStatusHint")}{" "}
        <Link href={ROUTES.accountActions} className="text-ig-link">
          {t("accountStatusMore")}
        </Link>
      </p>

      <div className="space-y-2">
        {rows.map((row) => (
          <Link
            key={row.key}
            href={ROUTES.accountActions}
            className="border-ig-border hover:bg-ig-bg-secondary flex items-center gap-3 rounded-2xl border px-4 py-4"
          >
            <span className="text-ig-text flex-1 text-sm">{t(row.key)}</span>
            <CircleCheck className="text-ig-success size-5 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
