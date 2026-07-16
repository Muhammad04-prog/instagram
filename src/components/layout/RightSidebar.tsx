"use client";

import { useTranslations } from "next-intl";
import { FollowButton } from "@/components/profile/FollowButton";
import { Loader } from "@/components/shared/Loader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { UserNameWithBadge } from "@/components/shared/VerifiedBadge";
import { useAuth } from "@/hooks/useAuth";
import { useMyProfile } from "@/hooks/useProfile";
import { useSuggestions } from "@/hooks/useUserSearch";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";

/**
 * Feed's right column, ≥1264px only (docs/screenshots/img10): my profile row +
 * "Suggested for you", each with the shared optimistic FollowButton.
 *
 * Suggestions are a real endpoint now (`/users/suggestions`) — Phase 3 filled
 * this list with `get-users`, i.e. simply "some accounts", because softclub had
 * nothing better. It also explains *why* each one is suggested (`followedBy`).
 */
export function RightSidebar() {
  const t = useTranslations("feed");
  const tFooter = useTranslations("footer");
  const { user } = useAuth();
  const { data: profile, isPending } = useMyProfile();
  const { data: suggestions } = useSuggestions();

  return (
    <aside className="hidden w-[320px] shrink-0 pt-9 pl-16 xl:block">
      {isPending ? (
        <Loader />
      ) : profile ? (
        <div className="mb-6 flex items-center gap-3">
          <Link href={ROUTES.myProfile}>
            <UserAvatar src={profile.avatarUrl} size={56} />
          </Link>
          <div className="min-w-0 flex-1">
            <Link href={ROUTES.myProfile} className="text-ig-text block text-sm font-semibold">
              <UserNameWithBadge userName={profile.userName} isVerified={profile.isVerified} />
            </Link>
            <p className="text-ig-text-secondary truncate text-sm">{profile.fullName}</p>
          </div>
          <button type="button" className="text-ig-primary text-xs font-semibold">
            {t("switch")}
          </button>
        </div>
      ) : null}

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-ig-text-secondary text-sm font-semibold">{t("suggestions")}</h2>
        <button type="button" className="text-ig-text text-xs font-semibold">
          {t("seeAllSuggestions")}
        </button>
      </div>

      <ul className="space-y-3">
        {suggestions
          ?.filter((candidate) => candidate.id !== user?.id)
          .map((candidate) => (
            <li key={candidate.id} className="flex items-center gap-3">
              <Link href={ROUTES.profile(candidate.id)}>
                <UserAvatar src={candidate.avatarUrl ?? null} size={44} />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={ROUTES.profile(candidate.id)}
                  className="text-ig-text block text-sm font-semibold"
                >
                  <UserNameWithBadge
                    userName={candidate.userName}
                    isVerified={candidate.isVerified}
                  />
                </Link>
                {/* `followedBy` is the mutual follows — IG's "Followed by X + N others". */}
                <p className="text-ig-text-secondary truncate text-xs">
                  {candidate.followedBy.length > 0
                    ? t("followedBy", {
                        user: candidate.followedBy[0] ?? "",
                        count: Math.max(0, candidate.followedByCount - 1),
                      })
                    : t("suggestedForYou")}
                </p>
              </div>
              <FollowButton userId={candidate.id} userName={candidate.userName} variant="link" />
            </li>
          ))}
      </ul>

      <p className="text-ig-text-secondary mt-6 text-xs uppercase">
        {tFooter("copyright", { year: new Date().getFullYear() })}
      </p>
    </aside>
  );
}
