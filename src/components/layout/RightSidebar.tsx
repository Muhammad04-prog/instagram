"use client";

import { useTranslations } from "next-intl";
import { FollowButton } from "@/components/profile/FollowButton";
import { Loader } from "@/components/shared/Loader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useAuth } from "@/hooks/useAuth";
import { useMyProfile } from "@/hooks/useProfile";
import { useUsers } from "@/hooks/useUserSearch";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { profileFullName } from "@/types/profile.types";

/**
 * Feed's right column, ≥1264px only (docs/screenshots/img10): my profile row +
 * "Suggested for you" from /User/get-users, each with the shared optimistic
 * FollowButton.
 */
export function RightSidebar() {
  const t = useTranslations("feed");
  const tFooter = useTranslations("footer");
  const { user } = useAuth();
  const { data: profile, isPending } = useMyProfile();
  const { data: suggestions } = useUsers({ pageNumber: 1, pageSize: 5 });

  return (
    <aside className="hidden w-[320px] shrink-0 pt-9 pl-16 xl:block">
      {isPending ? (
        <Loader />
      ) : profile ? (
        <div className="mb-6 flex items-center gap-3">
          <Link href={ROUTES.myProfile}>
            <UserAvatar src={profile.image} size={56} />
          </Link>
          <div className="min-w-0 flex-1">
            <Link
              href={ROUTES.myProfile}
              className="text-ig-text block truncate text-sm font-semibold"
            >
              {profile.userName}
            </Link>
            <p className="text-ig-text-secondary truncate text-sm">{profileFullName(profile)}</p>
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
          ?.filter((candidate) => candidate.id !== user?.userId)
          .map((candidate) => (
            <li key={candidate.id} className="flex items-center gap-3">
              <Link href={ROUTES.profile(candidate.id)}>
                <UserAvatar src={candidate.avatar} size={44} />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={ROUTES.profile(candidate.id)}
                  className="text-ig-text block truncate text-sm font-semibold"
                >
                  {candidate.userName}
                </Link>
                <p className="text-ig-text-secondary truncate text-xs">
                  {t("followerCount", { count: candidate.subscribersCount })}
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
