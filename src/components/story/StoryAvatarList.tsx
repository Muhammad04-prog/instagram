"use client";

import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { LiveRing } from "@/components/live/LiveRing";
import { ErrorState } from "@/components/shared/ErrorState";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { StoryRing } from "@/components/story/StoryRing";
import { StoryUploadDialog } from "@/components/story/StoryUploadDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useLiveFeed } from "@/hooks/useLive";
import { useMyProfile } from "@/hooks/useProfile";
import { useMyStories, useStories } from "@/hooks/useStories";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { allOwnStoriesSeen, useOwnStoriesSeenStore } from "@/store/ownStoriesSeen.store";

/** One rail step ≈ four bubbles, which is what IG's arrow advances. */
const SCROLL_STEP = 4 * 88;

/**
 * The rail above the feed (docs/screenshots/img10).
 *
 * `StoryRailItemDto` arrives grouped per author and carries `allViewed`, so the
 * grey ring is server truth. Phase 6 had to keep seen-state in localStorage
 * because softclub could not answer "have I seen this?", which left the ring
 * wrong in every other browser. That store is gone.
 */
export function StoryAvatarList() {
  const t = useTranslations("story");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { user } = useAuth();
  const { data: profile } = useMyProfile();
  const { data, isPending, isError, refetch } = useStories();
  const { data: myStories } = useMyStories();
  const { data: lives } = useLiveFeed();
  const [uploadOpen, setUploadOpen] = useState(false);
  const ownSeen = useOwnStoriesSeenStore((state) => state.seen);
  const pruneOwnSeen = useOwnStoriesSeenStore((state) => state.prune);

  // Stories expire after 24h; drop the notes for ones that can no longer exist
  // so the persisted record stays a handful of ids rather than a growing log.
  useEffect(() => {
    pruneOwnSeen();
  }, [pruneOwnSeen]);

  // Arrow visibility is measured, not assumed: with three stories there is
  // nothing to scroll to and IG shows no arrows at all.
  const railRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState({ left: false, right: false });

  const measure = useCallback(() => {
    const node = railRef.current;
    if (!node) return;
    setOverflow({
      left: node.scrollLeft > 8,
      right: node.scrollLeft + node.clientWidth < node.scrollWidth - 8,
    });
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, data, lives]);

  const scrollBy = (direction: 1 | -1) =>
    railRef.current?.scrollBy({ left: direction * SCROLL_STEP, behavior: "smooth" });

  if (isPending) {
    return (
      <div className="border-ig-separator mb-6 flex gap-4 border-b pb-4">
        {Array.from({ length: 7 }, (_, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <Skeleton className="size-[74px] rounded-full" />
            <Skeleton className="h-2 w-12" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={() => void refetch()} className="py-6" />;

  // The rail is other people; my own bubble is pinned first and driven by
  // `/stories/my`, so "Your story" is right regardless of what the rail says.
  // Someone broadcasting right now outranks a story they posted hours ago: IG
  // pins live hosts to the front and shows them once, as live.
  const activeLives = (lives ?? []).filter((live) => live.host.id !== user?.id);
  const liveHostIds = new Set(activeLives.map((live) => live.host.id));

  const others = data.filter(
    (item) => item.author.id !== user?.id && !liveHostIds.has(item.author.id),
  );
  const mine = myStories ?? [];
  const hasMine = mine.length > 0;
  // The server never records an author viewing their own story — `isViewed` and
  // the rail's `allViewed` both stay false forever — so my own ring can only
  // grey out from the local note. Everyone else's stays server truth.
  const myAllViewed = allOwnStoriesSeen(mine, ownSeen);

  return (
    <>
      <div className="border-ig-separator relative mb-6 border-b pb-4">
        <div
          ref={railRef}
          onScroll={measure}
          className="flex scrollbar-none gap-4 overflow-x-auto scroll-smooth"
        >
          {/* The «+» is always there, so a second story can be added without
              first having to get rid of the first one. With stories present the
              bubble itself opens them and the badge adds another — two targets,
              which is why the badge is its own button rather than part of the
              bubble's click area. */}
          <div className="group relative flex w-[74px] shrink-0 flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                hasMine ? router.push(ROUTES.stories(user?.id ?? "")) : setUploadOpen(true)
              }
              aria-label={hasMine ? t("yourStory") : t("addStory")}
              className="relative transition-transform duration-150 active:scale-95"
            >
              {hasMine ? (
                <StoryRing
                  src={profile?.avatarUrl ?? null}
                  alt={profile?.userName ?? ""}
                  seen={myAllViewed}
                />
              ) : (
                <UserAvatar src={profile?.avatarUrl} size={64} className="m-[5px]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              aria-label={t("addStory")}
              title={t("addStory")}
              className="bg-ig-primary hover:bg-ig-primary-hover absolute right-0.5 bottom-[26px] flex size-[22px] items-center justify-center rounded-full border-[3px] border-[color:var(--ig-bg)] transition-colors"
            >
              <Plus className="size-3.5 text-white" strokeWidth={3} />
            </button>

            <span className="text-ig-text w-full truncate text-center text-xs">
              {t("yourStory")}
            </span>
          </div>

          {activeLives.map((live) => (
            <button
              key={live.id}
              type="button"
              onClick={() => router.push(ROUTES.live(live.id))}
              className="group flex w-[74px] shrink-0 flex-col items-center gap-1.5"
            >
              <span className="transition-transform duration-150 group-active:scale-95">
                <LiveRing src={live.host.avatarUrl ?? null} alt={live.host.userName} size={64} />
              </span>
              <span className="text-ig-text w-full truncate text-center text-xs">
                {live.host.userName}
              </span>
            </button>
          ))}

          {others.map((item) => (
            <button
              key={item.author.id}
              type="button"
              onClick={() => router.push(ROUTES.stories(item.author.id))}
              className="group flex w-[74px] shrink-0 flex-col items-center gap-1.5"
            >
              <span className="transition-transform duration-150 group-active:scale-95">
                <StoryRing
                  src={item.author.avatarUrl ?? null}
                  alt={item.author.userName}
                  seen={item.allViewed}
                  closeFriends={item.hasCloseFriends}
                />
              </span>
              <span
                className={cn(
                  "w-full truncate text-center text-xs",
                  item.allViewed ? "text-ig-text-secondary" : "text-ig-text",
                )}
              >
                {item.author.userName}
              </span>
            </button>
          ))}
        </div>

        {/* IG's scroll chevrons: white pucks that sit over the rail edges and
            only exist while there is something in that direction. */}
        {overflow.left ? (
          <RailArrow side="left" label={tCommon("previous")} onClick={() => scrollBy(-1)} />
        ) : null}
        {overflow.right ? (
          <RailArrow side="right" label={tCommon("next")} onClick={() => scrollBy(1)} />
        ) : null}
      </div>

      <StoryUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </>
  );
}

function RailArrow({
  side,
  label,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "absolute top-[32px] z-10 flex size-6 items-center justify-center rounded-full bg-white text-black shadow-md transition-opacity hover:opacity-100",
        "opacity-90",
        side === "left" ? "-left-2" : "-right-2",
      )}
    >
      <Icon className="size-4" strokeWidth={2.5} />
    </button>
  );
}
