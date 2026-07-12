"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Loader } from "@/components/shared/Loader";
import { useAuth } from "@/hooks/useAuth";
import { useMyProfile } from "@/hooks/useProfile";
import { useUsers } from "@/hooks/useUserSearch";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { getImageUrl } from "@/lib/utils";
import { profileFullName } from "@/types/profile.types";

/**
 * Feed's right column, ≥1264px only (docs/screenshots/img10): my profile row +
 * "Suggested for you" from /User/get-users. The Follow button is wired in
 * Phase 4 together with followingRelationShip.service.
 */
export function RightSidebar() {
  const t = useTranslations("feed");
  const tNav = useTranslations("nav");
  const { user } = useAuth();
  const { data: profile, isPending } = useMyProfile();
  const { data: suggestions } = useUsers({ pageNumber: 1, pageSize: 5 });

  const avatar = getImageUrl(profile?.image);

  return (
    <aside className="hidden w-[320px] shrink-0 pt-9 pl-16 xl:block">
      {isPending ? (
        <Loader />
      ) : profile ? (
        <div className="mb-6 flex items-center gap-3">
          <Link href={ROUTES.myProfile}>
            {avatar ? (
              <Image
                src={avatar}
                alt=""
                width={56}
                height={56}
                className="size-14 rounded-full object-cover"
              />
            ) : (
              <span className="bg-ig-elevated block size-14 rounded-full" />
            )}
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
          .map((candidate) => {
            const candidateAvatar = getImageUrl(candidate.avatar);

            return (
              <li key={candidate.id} className="flex items-center gap-3">
                <Link href={ROUTES.profile(candidate.id)}>
                  {candidateAvatar ? (
                    <Image
                      src={candidateAvatar}
                      alt=""
                      width={44}
                      height={44}
                      className="size-11 rounded-full object-cover"
                    />
                  ) : (
                    <span className="bg-ig-elevated block size-11 rounded-full" />
                  )}
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
                <button type="button" className="text-ig-primary text-xs font-semibold">
                  {tNav("follow")}
                </button>
              </li>
            );
          })}
      </ul>

      <p className="text-ig-text-secondary mt-6 text-xs">
        © {new Date().getFullYear()} INSTAGRAM FROM META
      </p>
    </aside>
  );
}
