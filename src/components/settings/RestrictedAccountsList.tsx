"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { UserNameWithBadge } from "@/components/shared/VerifiedBadge";
import { useRestrictedAccounts, useToggleRestricted } from "@/hooks/useSettings";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";

/**
 * Settings → Restricted accounts. List-only, by design: adding someone here
 * happens from their profile's "…" menu ("go to their profile to restrict
 * them" — the page's own hint), not from a search box on this screen.
 */
export function RestrictedAccountsList() {
  const t = useTranslations("settings");
  const tProfile = useTranslations("profile");
  const { data, isPending, isError, refetch } = useRestrictedAccounts();
  const restrict = useToggleRestricted();

  if (isPending) return <Loader className="py-10" />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  if (data.length === 0) {
    return <EmptyState title={t("restrictedEmpty")} className="py-10" />;
  }

  return (
    <ul className="space-y-1">
      {data.map((person) => (
        <li key={person.id} className="flex items-center gap-3 py-2">
          <Link href={ROUTES.profile(person.id)}>
            <UserAvatar src={person.avatarUrl ?? null} alt={person.userName} size={44} />
          </Link>

          <div className="min-w-0 flex-1">
            <Link href={ROUTES.profile(person.id)} className="text-ig-text text-sm font-semibold">
              <UserNameWithBadge userName={person.userName} isVerified={person.isVerified} />
            </Link>
            {person.fullName ? (
              <p className="text-ig-text-secondary truncate text-sm">{person.fullName}</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => restrict.mutate({ userId: person.id, restrict: false })}
            disabled={restrict.isPending}
            className="bg-ig-button-secondary text-ig-text hover:bg-ig-button-secondary-hover shrink-0 rounded-lg px-4 py-1.5 text-sm font-semibold disabled:opacity-50"
          >
            {tProfile("unrestrict")}
          </button>
        </li>
      ))}
    </ul>
  );
}
