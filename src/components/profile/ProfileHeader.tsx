"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { SettingsIcon } from "@/components/icons";
import { FollowButton } from "@/components/profile/FollowButton";
import { FollowDialog, type FollowTab } from "@/components/profile/FollowDialog";
import { MessageUserButton } from "@/components/profile/MessageUserButton";
import { ProfileActionsMenu } from "@/components/profile/ProfileActionsMenu";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { cn, formatCount } from "@/lib/utils";
import type { OtherProfileDto, ProfileDto } from "@/types/profile.types";

/**
 * Profile header, measured off docs/screenshots/img35 (DPR 1.25): 150px avatar
 * in a 290px column, 20px username, stats row, bio, then the action buttons
 * spanning the full content width underneath.
 */
export function ProfileHeader({
  userId,
  profile,
  isMe,
}: {
  userId: string;
  /** Someone else's profile carries the relationship; mine does not need one. */
  profile: ProfileDto | OtherProfileDto;
  isMe: boolean;
}) {
  const t = useTranslations("profile");
  const [followTab, setFollowTab] = useState<FollowTab>("followers");
  const [followOpen, setFollowOpen] = useState(false);

  // `isFollowing` only exists on someone else's profile.
  const relation = "isFollowing" in profile ? profile : null;

  const fullName = profile.fullName;
  // The word only — the number is rendered next to it, so it must not repeat.
  const postsLabel = t("postsLabel", { count: profile.postsCount });
  const followersLabel = t("followersLabel", { count: profile.followersCount });
  const followingLabel = t("followingLabel", { count: profile.followingCount });

  const openFollowDialog = (tab: FollowTab) => {
    setFollowTab(tab);
    setFollowOpen(true);
  };

  return (
    <header className="pt-4 pb-8 md:pt-8">
      <div className="flex gap-6 md:gap-8">
        <div className="flex shrink-0 justify-center md:w-[290px]">
          <UserAvatar
            src={profile.avatarUrl}
            alt={profile.userName}
            size={150}
            priority
            className="size-[77px] md:size-[150px]"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-4">
            <h1 className="text-ig-text flex min-w-0 items-center gap-1.5 text-xl font-normal">
              <span className="truncate">{profile.userName}</span>
              {profile.isVerified ? <VerifiedBadge className="size-[18px]" /> : null}
            </h1>
            {isMe ? (
              <Link
                href={ROUTES.settings}
                aria-label={t("settings")}
                className="text-ig-text hidden md:block"
              >
                <SettingsIcon className="size-6" />
              </Link>
            ) : (
              <ProfileActionsMenu
                userId={userId}
                userName={profile.userName}
                isBlocked={relation?.isBlocked ?? false}
                className="ml-auto"
              />
            )}
          </div>

          {fullName ? <p className="text-ig-text mt-2 text-sm">{fullName}</p> : null}

          <Stats
            profile={profile}
            className="mt-4 hidden md:flex"
            onOpen={openFollowDialog}
            postsLabel={postsLabel}
            followersLabel={followersLabel}
            followingLabel={followingLabel}
          />

          <Bio profile={profile} className="mt-4 hidden md:block" />
        </div>
      </div>

      {/* Buttons sit under the whole block and share its width (img35). */}
      <div className="mt-6 flex gap-2">
        {isMe ? (
          <>
            <Link
              href={ROUTES.editProfile}
              className="bg-ig-button-secondary text-ig-text hover:bg-ig-button-secondary-hover flex-1 rounded-lg py-1.5 text-center text-sm font-semibold"
            >
              {t("editProfile")}
            </Link>
            {/* "View archive" now goes to the story archive it names (img45).
                It pointed at Saved posts, because softclub had no archive. */}
            <Link
              href={ROUTES.storyArchive}
              className="bg-ig-button-secondary text-ig-text hover:bg-ig-button-secondary-hover flex-1 rounded-lg py-1.5 text-center text-sm font-semibold"
            >
              {t("viewArchive")}
            </Link>
          </>
        ) : (
          <>
            {/* The relationship is already on the profile we fetched — hand it
                over so the button does not ask for it a second time. */}
            <FollowButton
              userId={userId}
              userName={profile.userName}
              following={relation?.isFollowing ?? false}
              requested={relation?.hasRequestPending ?? false}
              className="flex-1"
            />
            <MessageUserButton userId={userId} />
          </>
        )}
      </div>

      <Bio profile={profile} className="mt-6 md:hidden" />

      {/* On mobile IG moves the stats to a bordered strip below the bio. */}
      <Stats
        profile={profile}
        className="border-ig-separator mt-6 justify-around border-t pt-3 text-center md:hidden"
        stacked
        onOpen={openFollowDialog}
        postsLabel={postsLabel}
        followersLabel={followersLabel}
        followingLabel={followingLabel}
      />

      <FollowDialog
        userId={userId}
        tab={followTab}
        onTabChange={setFollowTab}
        open={followOpen}
        onOpenChange={setFollowOpen}
      />
    </header>
  );
}

function Stats({
  profile,
  className,
  stacked = false,
  onOpen,
  postsLabel,
  followersLabel,
  followingLabel,
}: {
  profile: ProfileDto;
  className?: string;
  stacked?: boolean;
  onOpen: (tab: FollowTab) => void;
  postsLabel: string;
  followersLabel: string;
  followingLabel: string;
}) {
  const item = stacked ? "flex flex-col text-sm" : "text-sm";
  const value = "text-ig-text font-semibold";
  const label = stacked ? "text-ig-text-secondary text-xs" : "text-ig-text";

  return (
    <ul className={cn("flex gap-10", className)}>
      <li className={item}>
        <span className={value}>{formatCount(profile.postsCount)}</span>{" "}
        <span className={label}>{postsLabel}</span>
      </li>
      <li>
        <button type="button" onClick={() => onOpen("followers")} className={item}>
          <span className={value}>{formatCount(profile.followersCount)}</span>{" "}
          <span className={label}>{followersLabel}</span>
        </button>
      </li>
      <li>
        <button type="button" onClick={() => onOpen("following")} className={item}>
          <span className={value}>{formatCount(profile.followingCount)}</span>{" "}
          <span className={label}>{followingLabel}</span>
        </button>
      </li>
    </ul>
  );
}

function Bio({ profile, className }: { profile: ProfileDto; className?: string }) {
  if (!profile.about && !profile.occupation) return null;

  return (
    <div className={cn("text-ig-text space-y-1 text-sm whitespace-pre-line", className)}>
      {profile.occupation ? <p className="text-ig-text-secondary">{profile.occupation}</p> : null}
      {profile.about ? <p>{profile.about}</p> : null}
    </div>
  );
}
