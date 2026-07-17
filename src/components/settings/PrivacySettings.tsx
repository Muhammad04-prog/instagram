"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { UserNameWithBadge } from "@/components/shared/VerifiedBadge";
import { FollowRequestsList } from "@/components/profile/FollowRequestsList";
import { Switch } from "@/components/ui/switch";
import { useBlockedUsers, useToggleBlock } from "@/hooks/useFollow";
import { useMyProfile, useUpdatePrivacy } from "@/hooks/useProfile";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { flattenPages } from "@/lib/cursor";

/**
 * Settings → privacy: the private-account switch, incoming follow requests and
 * the blocked list.
 *
 * None of this could exist on softclub — it had no privacy, no requests and no
 * blocking. `isPrivate` is the switch's truth, straight off my profile.
 */
export function PrivacySettings() {
  const t = useTranslations("profile");
  const { data: profile, isPending, isError, refetch } = useMyProfile();
  const privacy = useUpdatePrivacy();

  if (isPending) return <Loader className="py-10" />;
  if (isError || !profile) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h2 className="text-ig-text text-base font-semibold">{t("privacyTitle")}</h2>

        <label className="border-ig-border flex cursor-pointer items-center gap-4 rounded-2xl border px-4 py-4">
          <span className="min-w-0 flex-1">
            <span className="text-ig-text block text-sm">{t("privateAccount")}</span>
            <span className="text-ig-text-secondary block text-xs">{t("privateAccountHint")}</span>
          </span>
          <Switch
            checked={profile.isPrivate}
            disabled={privacy.isPending}
            onCheckedChange={(isPrivate) => privacy.mutate({ isPrivate })}
          />
        </label>
      </section>

      {/* Only a private account can have requests — hide the section otherwise
          rather than show a permanently empty list. */}
      {profile.isPrivate ? (
        <section className="space-y-3">
          <h2 className="text-ig-text text-base font-semibold">{t("followRequests")}</h2>
          <FollowRequestsList />
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-ig-text text-base font-semibold">{t("blockedAccounts")}</h2>
        <BlockedList />
      </section>
    </div>
  );
}

function BlockedList() {
  const t = useTranslations("profile");
  const { data, isPending, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useBlockedUsers();
  const block = useToggleBlock();

  if (isPending) return <Loader className="py-6" />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  const blocked = flattenPages(data);
  if (blocked.length === 0) return <EmptyState title={t("blockedEmpty")} className="py-6" />;

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
              <p className="text-ig-text-secondary truncate text-sm">{person.fullName}</p>
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
