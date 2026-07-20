"use client";

import { useTranslations } from "next-intl";
import { FollowButton } from "@/components/profile/FollowButton";
import { ProfileHoverCard } from "@/components/profile/ProfileHoverCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { RowSkeleton } from "@/components/shared/RowSkeleton";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { UserNameWithBadge } from "@/components/shared/VerifiedBadge";
import { useAuth } from "@/hooks/useAuth";
import { useSuggestions } from "@/hooks/useUserSearch";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";

/**
 * «Все» from the feed sidebar (docs/screenshots/img4): the same suggestions,
 * given room to breathe — avatar, name, why they are suggested, and a full-width
 * follow button per row.
 *
 * ⚠️ `GET /users/suggestions` takes **no** query parameters (checked against the
 * live docs-json, 198 endpoints) — no limit, no cursor. So this is not paginated
 * and there is no "load more": the server decides how many come back, and this
 * page shows all of them rather than the sidebar's truncated five.
 */
export function SuggestionsScreen() {
  const t = useTranslations("feed");
  const { user } = useAuth();
  const { data, isPending, isError, refetch } = useSuggestions();

  const suggestions = (data ?? []).filter((candidate) => candidate.id !== user?.id);

  return (
    <div className="mx-auto w-full max-w-[620px] px-4 py-8">
      <h1 className="text-ig-text mb-6 text-base font-semibold">{t("suggestionsTitle")}</h1>

      {isPending ? (
        <RowSkeleton rows={8} />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} className="py-12" />
      ) : suggestions.length === 0 ? (
        <EmptyState title={t("noSuggestions")} className="py-12" />
      ) : (
        <ul className="space-y-2">
          {suggestions.map((candidate) => (
            <li key={candidate.id} className="flex items-center gap-4 py-1.5">
              <ProfileHoverCard userId={candidate.id}>
                <Link href={ROUTES.profile(candidate.id)}>
                  <UserAvatar
                    src={candidate.avatarUrl ?? null}
                    alt={candidate.userName}
                    size={56}
                  />
                </Link>
              </ProfileHoverCard>

              <div className="min-w-0 flex-1">
                <ProfileHoverCard userId={candidate.id} className="max-w-full">
                  <Link
                    href={ROUTES.profile(candidate.id)}
                    className="text-ig-text block truncate text-sm font-semibold hover:opacity-70"
                  >
                    <UserNameWithBadge
                      userName={candidate.userName}
                      isVerified={candidate.isVerified}
                    />
                  </Link>
                </ProfileHoverCard>

                {candidate.fullName ? (
                  <p className="text-ig-text-secondary truncate text-sm">{candidate.fullName}</p>
                ) : null}

                <p className="text-ig-text-secondary truncate text-xs">
                  {candidate.followedBy.length > 0
                    ? t("followedBy", {
                        user: candidate.followedBy[0] ?? "",
                        count: Math.max(0, candidate.followedByCount - 1),
                      })
                    : t("suggestedForYou")}
                </p>
              </div>

              <FollowButton
                userId={candidate.id}
                userName={candidate.userName}
                className="w-[160px] shrink-0"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
