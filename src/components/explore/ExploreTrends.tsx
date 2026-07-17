"use client";

import { useTranslations } from "next-intl";
import { FollowButton } from "@/components/profile/FollowButton";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchTop } from "@/hooks/useSearch";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { formatCount } from "@/lib/utils";

/**
 * What is moving this week: hashtags from the last 7 days, and the accounts
 * that grew the most in the same window.
 *
 * It sits above the grid, where IG puts its topic chips. Quiet on failure —
 * trends are a garnish, and an error state here would shout over the Explore
 * grid, which is the actual page.
 */
export function ExploreTrends() {
  const t = useTranslations("explore");
  const { data, isPending, isError } = useSearchTop();

  if (isError) return null;

  if (isPending) {
    return (
      <div className="mb-6 flex gap-2">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-8 w-24 rounded-full" />
        ))}
      </div>
    );
  }

  const { hashtags, accounts } = data;
  if (hashtags.length === 0 && accounts.length === 0) return null;

  return (
    <div className="mb-6 space-y-4">
      {hashtags.length > 0 ? (
        <ul className="flex scrollbar-none gap-2 overflow-x-auto">
          {hashtags.map((hashtag) => (
            <li key={hashtag.id}>
              <Link
                href={ROUTES.hashtag(hashtag.name)}
                className="bg-ig-button-secondary hover:bg-ig-button-secondary-hover text-ig-text flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold whitespace-nowrap"
              >
                #{hashtag.name}
                <span className="text-ig-text-secondary text-xs font-normal">
                  {formatCount(hashtag.postsCount)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {accounts.length > 0 ? (
        <section>
          <h2 className="text-ig-text-secondary mb-2 text-sm font-semibold">
            {t("accountsOfTheWeek")}
          </h2>
          <ul className="flex scrollbar-none gap-3 overflow-x-auto pb-1">
            {accounts.map((account) => (
              <li
                key={account.id}
                className="border-ig-border flex w-40 shrink-0 flex-col items-center gap-2 rounded-lg border p-4"
              >
                <Link
                  href={ROUTES.profile(account.id)}
                  className="flex flex-col items-center gap-1"
                >
                  <UserAvatar src={account.avatarUrl} alt={account.userName} size={56} />
                  <span className="text-ig-text flex max-w-full items-center gap-1 text-sm font-semibold">
                    <span className="truncate">{account.userName}</span>
                    {account.isVerified ? <VerifiedBadge /> : null}
                  </span>
                  <span className="text-ig-text-secondary max-w-full truncate text-xs">
                    {account.fullName}
                  </span>
                </Link>
                {/* `following` is deliberately not passed: UserBriefDto has no
                    relationship on it, and passing a guess makes the button skip
                    its own lookup — it would read "Follow" for people you
                    already follow. Left alone, it asks and knows. */}
                <FollowButton userId={account.id} userName={account.userName} className="w-full" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
