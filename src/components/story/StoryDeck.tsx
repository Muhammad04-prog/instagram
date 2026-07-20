"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useCallback } from "react";
import { InstagramWordmark } from "@/components/icons/InstagramLogo";
import { StoryRing } from "@/components/story/StoryRing";
import { StoryViewer } from "@/components/story/StoryViewer";
import { useAuth } from "@/hooks/useAuth";
import { useMyProfile } from "@/hooks/useProfile";
import { useMyStories, useStories } from "@/hooks/useStories";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { allOwnStoriesSeen, useOwnStoriesSeenStore } from "@/store/ownStoriesSeen.store";

/** How many neighbouring authors IG keeps parked on each side. */
const NEIGHBOURS = 2;

/** One author in the playback order — the rail row, flattened. */
interface DeckAuthor {
  id: string;
  userName: string;
  avatarUrl: string | null;
  allViewed: boolean;
  latestAt: string | null;
}

/**
 * IG's story stage (docs/screenshots/img10, img11): the open story centred, the
 * authors before and after it parked alongside as dimmed cards, and the whole
 * thing on a dark backdrop with the wordmark top-left.
 *
 * The order comes from the rail — the same order the bubbles above the feed are
 * in — so "next" here means what it means there. `StoryViewer` still owns a
 * single author's slides; this owns moving *between* authors, which is why
 * running off the end of one now lands on the next instead of closing.
 */
export function StoryDeck({ userId, onClose }: { userId: string; onClose: () => void }) {
  const t = useTranslations("story");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const router = useRouter();
  const { user } = useAuth();
  const { data: rail } = useStories();
  const { data: myStories } = useMyStories();
  const { data: profile } = useMyProfile();
  const ownSeen = useOwnStoriesSeenStore((state) => state.seen);

  // My own row is rebuilt from `/stories/my` rather than taken from the rail —
  // the rail does list me, but its `allViewed` is permanently false for the
  // author (the server drops self-views), so its copy is unusable here.
  const authors: DeckAuthor[] = [];

  if ((myStories?.length ?? 0) > 0 && user?.id) {
    authors.push({
      id: user.id,
      userName: profile?.userName ?? "",
      avatarUrl: profile?.avatarUrl ?? null,
      // Local, not `isViewed` — the server discards an author's own view.
      allViewed: allOwnStoriesSeen(myStories ?? [], ownSeen),
      latestAt: myStories?.[0]?.createdAt ?? null,
    });
  }

  for (const item of rail ?? []) {
    if (item.author.id === user?.id) continue;
    authors.push({
      id: item.author.id,
      userName: item.author.userName,
      avatarUrl: item.author.avatarUrl ?? null,
      allViewed: item.allViewed,
      latestAt: item.latestAt,
    });
  }

  const index = authors.findIndex((author) => author.id === userId);
  const goTo = useCallback(
    (author: DeckAuthor | undefined) => {
      if (!author) return onClose();
      router.replace(ROUTES.stories(author.id));
    },
    [onClose, router],
  );

  // -1 means the rail has not loaded (or this author is not on it — a deep link
  // to someone whose stories expired mid-session). Playing solo is the right
  // fallback: no neighbours, and finishing closes.
  const previous = index > 0 ? authors[index - 1] : undefined;
  const next = index >= 0 && index + 1 < authors.length ? authors[index + 1] : undefined;

  const before = index > 0 ? authors.slice(Math.max(0, index - NEIGHBOURS), index) : [];
  const after = index >= 0 ? authors.slice(index + 1, index + 1 + NEIGHBOURS) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a1a]">
      <div className="pointer-events-none absolute top-5 left-6 z-20 hidden text-white md:block">
        <InstagramWordmark className="h-8 w-auto" />
      </div>

      <button
        type="button"
        aria-label={tCommon("close")}
        onClick={onClose}
        className="absolute top-4 right-5 z-20 text-white/80 transition-colors hover:text-white"
      >
        <X className="size-8" strokeWidth={1.5} />
      </button>

      {/* Three tracks of equal weight: the story is the middle one, so it stays
          dead-centre whether or not there are neighbours to park beside it.
          A plain flex row let a one-sided list shove the story off-centre. */}
      <div className="flex w-full items-center justify-center gap-3 lg:gap-5">
        <div className="hidden flex-1 items-center justify-end gap-3 lg:flex">
          {before.map((author) => (
            <NeighbourCard
              key={author.id}
              author={author}
              label={author.latestAt ? format.relativeTime(new Date(author.latestAt)) : ""}
              onClick={() => goTo(author)}
            />
          ))}
        </div>

        {previous ? (
          <DeckArrow side="left" label={tCommon("previous")} onClick={() => goTo(previous)} />
        ) : (
          <span className="hidden w-8 shrink-0 md:block" aria-hidden />
        )}

        <StoryViewer
          key={userId}
          userId={userId}
          onClose={onClose}
          showClose={false}
          onExitForward={() => goTo(next)}
          onExitBackward={previous ? () => goTo(previous) : undefined}
        />

        {next ? (
          <DeckArrow side="right" label={tCommon("next")} onClick={() => goTo(next)} />
        ) : (
          <span className="hidden w-8 shrink-0 md:block" aria-hidden />
        )}

        <div className="hidden flex-1 items-center justify-start gap-3 lg:flex">
          {after.map((author) => (
            <NeighbourCard
              key={author.id}
              author={author}
              label={author.latestAt ? format.relativeTime(new Date(author.latestAt)) : ""}
              onClick={() => goTo(author)}
            />
          ))}
        </div>
      </div>

      <p className="sr-only">{t("title")}</p>
    </div>
  );
}

/**
 * A parked author: dimmed card, ringed avatar and name in the middle. The rail
 * carries no media for other people's stories — only author, count and
 * `latestAt` — so the card is built from the author rather than a thumbnail.
 */
function NeighbourCard({
  author,
  label,
  onClick,
}: {
  author: DeckAuthor;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-[280px] w-[160px] shrink-0 flex-col items-center justify-center gap-2 rounded-xl bg-white/[0.06] transition-all duration-200 hover:bg-white/[0.1]"
    >
      <span className="opacity-80 transition-opacity duration-200 group-hover:opacity-100">
        <StoryRing
          src={author.avatarUrl}
          alt={author.userName}
          seen={author.allViewed}
          size={56}
          gapClassName="bg-[#1a1a1a]"
        />
      </span>
      <span className="max-w-[85%] truncate text-sm font-semibold text-white">
        {author.userName}
      </span>
      {label ? (
        <span className="text-xs text-white/60" suppressHydrationWarning>
          {label}
        </span>
      ) : null}
    </button>
  );
}

function DeckArrow({
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
        "hidden size-8 shrink-0 items-center justify-center rounded-full bg-white/90 text-black shadow-md",
        "transition-transform duration-150 hover:scale-105 md:flex",
      )}
    >
      <Icon className="size-5" strokeWidth={2.5} />
    </button>
  );
}
