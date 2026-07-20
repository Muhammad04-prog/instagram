"use client";

import { Lock } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { FollowButton } from "@/components/profile/FollowButton";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { UserNameWithBadge } from "@/components/shared/VerifiedBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserPosts } from "@/hooks/usePosts";
import { useUserProfile } from "@/hooks/useProfile";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { flattenPages } from "@/lib/cursor";
import { cn, formatCount, getImageUrl } from "@/lib/utils";

/** IG waits before committing to the popup, so brushing past a row does nothing. */
const OPEN_DELAY_MS = 400;
const CLOSE_DELAY_MS = 200;

/**
 * IG's profile peek (docs/screenshots/img14, img15): hovering a username or
 * avatar anywhere a person is listed floats a card with their counts, their
 * three most recent posts, and a follow button.
 *
 * Both queries are `enabled` only once the card actually opens — a suggestions
 * list is a dozen people, and prefetching every one of them on mount would be
 * a dozen profile fetches nobody asked for. A private account has no grid to
 * show, so it gets IG's padlock panel instead (img14).
 */
export function ProfileHoverCard({
  userId,
  children,
  className,
}: {
  userId: string;
  children: ReactNode;
  className?: string;
}) {
  const t = useTranslations("profile");
  const [open, setOpen] = useState(false);
  const [timer, setTimer] = useState<number | undefined>(undefined);

  const { data: profile } = useUserProfile(open ? userId : "");
  const postsQuery = useUserPosts(userId, open && profile?.isPrivate === false);
  const posts = flattenPages(postsQuery.data).slice(0, 3);

  const schedule = (next: boolean, delay: number) => {
    window.clearTimeout(timer);
    setTimer(window.setTimeout(() => setOpen(next), delay));
  };

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => schedule(true, OPEN_DELAY_MS)}
      onMouseLeave={() => schedule(false, CLOSE_DELAY_MS)}
    >
      {children}

      {open ? (
        <div
          // Sits below-left of the trigger, the way IG anchors it in a sidebar
          // list. `z-50` clears the feed; the card is not interactive-blocking
          // because leaving it re-runs the close timer.
          className="bg-ig-elevated border-ig-border absolute top-full left-0 z-50 mt-1 w-[340px] overflow-hidden rounded-xl border shadow-2xl"
          onMouseEnter={() => window.clearTimeout(timer)}
          onMouseLeave={() => schedule(false, CLOSE_DELAY_MS)}
        >
          {!profile ? (
            <div className="space-y-3 p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-14 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 p-4">
                <Link href={ROUTES.profile(profile.id)}>
                  <UserAvatar src={profile.avatarUrl} alt={profile.userName} size={56} />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={ROUTES.profile(profile.id)}
                    className="text-ig-text block truncate text-base font-semibold hover:opacity-70"
                  >
                    <UserNameWithBadge
                      userName={profile.userName}
                      isVerified={profile.isVerified}
                    />
                  </Link>
                  <p className="text-ig-text-secondary truncate text-sm">{profile.fullName}</p>
                </div>
              </div>

              <dl className="flex items-start justify-around px-4 pb-4 text-center">
                <Stat value={profile.postsCount} label={t("posts")} />
                <Stat value={profile.followersCount} label={t("followers")} />
                <Stat value={profile.followingCount} label={t("following")} />
              </dl>

              {profile.isPrivate ? (
                <div className="flex flex-col items-center gap-2 px-6 pb-5 text-center">
                  <span className="story-ring mb-1 flex size-14 items-center justify-center rounded-full p-[2px]">
                    <span className="bg-ig-elevated text-ig-text flex size-full items-center justify-center rounded-full">
                      <Lock className="size-6" />
                    </span>
                  </span>
                  <p className="text-ig-text text-sm font-semibold">{t("privateTitle")}</p>
                  <p className="text-ig-text-secondary text-sm">{t("privateDescription")}</p>
                </div>
              ) : posts.length > 0 ? (
                <ul className="grid grid-cols-3 gap-0.5">
                  {posts.map((post) => {
                    const thumb = getImageUrl(post.media[0]?.url);
                    return (
                      <li key={post.id} className="bg-ig-bg-secondary relative aspect-square">
                        <Link href={ROUTES.post(post.id)} className="block size-full">
                          {thumb ? (
                            <Image src={thumb} alt="" fill sizes="114px" className="object-cover" />
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : null}

              <div className="p-3">
                <FollowButton userId={profile.id} userName={profile.userName} className="w-full" />
              </div>
            </>
          )}
        </div>
      ) : null}
    </span>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <dt className="text-ig-text text-base font-semibold">{formatCount(value)}</dt>
      <dd className="text-ig-text-secondary text-xs">{label}</dd>
    </div>
  );
}
