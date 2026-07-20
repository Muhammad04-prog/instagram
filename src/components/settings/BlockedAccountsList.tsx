"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { UserNameWithBadge } from "@/components/shared/VerifiedBadge";
import { useBlockedUsers, useToggleBlock } from "@/hooks/useFollow";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { flattenPages } from "@/lib/cursor";

/** Settings → Заблокированные (img: "Заблокированные аккаунты"), moved out of
 * PrivacySettings into its own screen — `follow.getBlocked` / `follow.unblock`. */
export function BlockedAccountsList() {
  const t = useTranslations("profile");
  const { data, isPending, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useBlockedUsers();
  const block = useToggleBlock();

  if (isPending) return <Loader className="py-10" />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  const blocked = flattenPages(data);
  if (blocked.length === 0) return <EmptyState title={t("blockedEmpty")} className="py-10" />;

  return (
    <div>
      <ul className="space-y-1">
        {blocked.map((person) => (
          <li key={person.id} className="flex items-center gap-3 py-2">
            <Link href={ROUTES.profile(person.id)}>
              <UserAvatar src={person.avatarUrl ?? null} alt={person.userName} size={44} />
            </Link>

            <div className="min-w-0 flex-1">
              <Link href={ROUTES.profile(person.id)} className="text-ig-text text-sm font-semibold">
                <UserNameWithBadge userName={person.userName} isVerified={person.isVerified} />
              </Link>
              <p className="text-ig-text-secondary truncate text-sm">{t("blockedDescription")}</p>
            </div>

            <button
              type="button"
              onClick={() => block.mutate({ userId: person.id, block: false })}
              disabled={block.isPending}
              className="bg-ig-button-secondary text-ig-text hover:bg-ig-button-secondary-hover shrink-0 rounded-lg px-4 py-1.5 text-sm font-semibold disabled:opacity-50"
            >
              {t("unblock")}
            </button>
          </li>
        ))}
      </ul>

      {hasNextPage ? (
        <button
          type="button"
          onClick={() => void fetchNextPage()}
          disabled={isFetchingNextPage}
          className="text-ig-primary mt-4 text-sm font-semibold disabled:opacity-50"
        >
          {t("loadMore")}
        </button>
      ) : null}
    </div>
  );
}
