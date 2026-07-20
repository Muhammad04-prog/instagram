"use client";

import {
  BarChart2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Music2,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { HeartIcon } from "@/components/icons";
import { CreateAddYoursDialog } from "@/components/story/CreateAddYoursDialog";
import { StoryInsightsDialog } from "@/components/story/StoryInsightsDialog";
import { StoryReplyBar } from "@/components/story/StoryReplyBar";
import { StoryStickerLayer } from "@/components/story/StoryStickerLayer";
import { StoryViewersDialog } from "@/components/story/StoryViewersDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useAuth } from "@/hooks/useAuth";
import { useDeleteStory, useLikeStory, useMarkStorySeen, useUserStories } from "@/hooks/useStories";
import { useUserProfile } from "@/hooks/useProfile";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { filterCss } from "@/lib/filters";
import { cn, getImageUrl } from "@/lib/utils";

/** One parsed overlay from `StoryDto.overlays` (text/sticker; x/y are 0–1). */
type StoryOverlay = { type?: string; value?: string; x?: number; y?: number };

const SLIDE_MS = 5000;
const TICK_MS = 50;

/**
 * One author's slides: a progress bar per slide (5s each), tap left/right,
 * hold to pause, ←/→ to move, Space to pause, Esc to close
 * (docs/screenshots/img10, img11).
 *
 * Moving *between* authors belongs to `StoryDeck`, which wraps this and hands
 * down `onExitForward`/`onExitBackward` — running off either end of the slides
 * hands control back rather than closing outright.
 */
export function StoryViewer({
  userId,
  onClose,
  showClose = true,
  onExitForward,
  onExitBackward,
}: {
  userId: string;
  onClose: () => void;
  /** The deck draws its own close button, in the screen corner rather than the card. */
  showClose?: boolean;
  /** Past the last slide. Falls back to closing when playing solo. */
  onExitForward?: () => void;
  /** Back past the first slide; absent when there is no earlier author. */
  onExitBackward?: () => void;
}) {
  const t = useTranslations("story");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const format = useFormatter();
  const { user } = useAuth();

  const { data, isPending, isError, refetch } = useUserStories(userId);

  // `StoryDto` carries the media, not the author — the old grouped-by-author
  // response used to hand both over at once. The header reads the profile
  // instead (cached, and usually already warm from the rail or the grid).
  const { data: author } = useUserProfile(userId);
  const markSeen = useMarkStorySeen();
  const likeStory = useLikeStory(userId);
  const deleteStory = useDeleteStory();

  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [viewersOpen, setViewersOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [addYoursOpen, setAddYoursOpen] = useState(false);
  // A reply bar in use must freeze the slide — see `paused` in the timer effect.
  const [replying, setReplying] = useState(false);
  // A sticker being answered (text/slider) must freeze the slide too.
  const [stickerBusy, setStickerBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [broken, setBroken] = useState(false);
  const [audioBroken, setAudioBroken] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  // Mirrors `progress` for the interval, so it can decide to advance without
  // reading render state. See the timer effect.
  const progressRef = useRef(0);

  const stories = data ?? [];
  const current = stories[index];
  const isMine = userId === user?.id;

  const resetProgress = useCallback(() => {
    progressRef.current = 0;
    setProgress(0);
    setBroken(false);
  }, []);

  // ⚠️ The hand-off must NOT live inside a `setIndex` updater. Updaters run
  // during render, and `onExitForward` navigates — React flagged it as
  // "Cannot update a component (Router) while rendering StoryViewer". Reading
  // `index` from state keeps the navigation in the event handler where it
  // belongs; the extra dep is the price and it is the correct one.
  const next = useCallback(() => {
    if (index + 1 >= stories.length) {
      // Hand over to the deck when there is a next author; closing is the
      // solo-playback fallback (deep link, rail not loaded).
      if (onExitForward) onExitForward();
      else onClose();
      return;
    }
    resetProgress();
    setIndex(index + 1);
  }, [index, onClose, onExitForward, resetProgress, stories.length]);

  const previous = useCallback(() => {
    // Rewinding off the front rewinds to the previous author, matching IG.
    // Without one, stay put on the first slide rather than closing.
    if (index === 0) {
      onExitBackward?.();
      return;
    }
    resetProgress();
    setIndex(index - 1);
  }, [index, onExitBackward, resetProgress]);

  // Each slide counts as a view exactly once (add-story-view + grey ring).
  // `isMine` matters: the server discards an author's view of their own story,
  // so those are additionally noted client-side.
  useEffect(() => {
    if (current) markSeen(current.id, isMine);
  }, [current, isMine, markSeen]);

  // The attached track plays while the slide is up and mirrors the pause state
  // (hold-to-pause, reply bar, viewers sheet). Autoplay-with-sound is allowed
  // because the viewer was opened by a click; a rejected play is swallowed.
  const frozen =
    paused || viewersOpen || confirmOpen || replying || stickerBusy || insightsOpen || addYoursOpen;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (frozen) {
      audio.pause();
    } else {
      void audio.play().catch(() => {});
    }
  }, [frozen, current]);

  // Elapsed time is kept in a ref and mirrored into state only for painting.
  // The decision to advance therefore happens in the interval callback — an
  // event, where navigating is legal — rather than inside a `setProgress`
  // updater (which runs during render and triggered "Cannot update Router
  // while rendering StoryViewer") or inside an effect body (cascading renders).
  useEffect(() => {
    if (!current || frozen) return;

    const timer = window.setInterval(() => {
      const elapsed = progressRef.current + TICK_MS;
      if (elapsed >= SLIDE_MS) {
        next();
        return;
      }
      progressRef.current = elapsed;
      setProgress(elapsed);
    }, TICK_MS);

    return () => window.clearInterval(timer);
  }, [current, frozen, next]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") previous();
      if (event.key === " ") {
        event.preventDefault();
        setPaused((value) => !value);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, previous, onClose]);

  if (isPending) return <Loader className="py-20" />;
  if (isError) return <ErrorState onRetry={() => void refetch()} className="py-20" />;
  if (!data || stories.length === 0 || !current) {
    return <ErrorState title={t("noStories")} className="py-20" />;
  }

  const url = getImageUrl(current.mediaUrl) ?? "";
  const mediaFilter = filterCss(current.filter);
  const overlays: StoryOverlay[] = Array.isArray(current.overlays)
    ? (current.overlays as StoryOverlay[])
    : [];
  const music = current.music;
  const audioSrc = music?.streamUrl ?? music?.previewUrl ?? null;

  return (
    <div className="relative flex aspect-[9/16] max-h-[92vh] w-[420px] max-w-[95vw] shrink-0 flex-col overflow-hidden rounded-xl bg-black shadow-2xl">
      <div className="absolute top-0 right-0 left-0 z-10 flex gap-1 p-2">
        {stories.map((story, position) => (
          <span key={story.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
            <span
              className="block h-full bg-white"
              style={{
                width:
                  position < index
                    ? "100%"
                    : position === index
                      ? `${(progress / SLIDE_MS) * 100}%`
                      : "0%",
              }}
            />
          </span>
        ))}
      </div>

      <div className="absolute top-5 right-0 left-0 z-10 flex items-center gap-3 px-3 pt-2">
        <Link href={ROUTES.profile(userId)} onClick={onClose}>
          <UserAvatar src={author?.avatarUrl ?? null} alt={author?.userName ?? ""} size={32} />
        </Link>
        <Link
          href={ROUTES.profile(userId)}
          onClick={onClose}
          className="text-sm font-semibold text-white"
        >
          {author?.userName}
        </Link>
        <time
          dateTime={current.createdAt}
          className="text-xs text-white/70"
          suppressHydrationWarning
        >
          {format.relativeTime(new Date(current.createdAt), new Date())}
        </time>

        <div className="ml-auto flex items-center gap-3">
          {isMine ? (
            <button
              type="button"
              aria-label={t("viewInsights")}
              onClick={() => setInsightsOpen(true)}
              className="text-white/90 hover:text-white"
            >
              <BarChart2 className="size-5" />
            </button>
          ) : null}
          {isMine && !current.addYoursPromptId ? (
            <button
              type="button"
              aria-label={t("startAddYours")}
              onClick={() => setAddYoursOpen(true)}
              className="text-white/90 hover:text-white"
            >
              <Sparkles className="size-5" />
            </button>
          ) : null}
          {isMine ? (
            <button
              type="button"
              aria-label={t("deleteStory")}
              onClick={() => setConfirmOpen(true)}
              className="text-white/90 hover:text-white"
            >
              <Trash2 className="size-5" />
            </button>
          ) : null}
          {showClose ? (
            <button
              type="button"
              aria-label={tCommon("close")}
              onClick={onClose}
              className="text-white/90 hover:text-white"
            >
              <X className="size-6" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Tap zones: left = previous, right = next; holding either pauses. */}
      <div
        className="relative flex-1"
        onPointerDown={() => setPaused(true)}
        onPointerUp={() => setPaused(false)}
        onPointerLeave={() => setPaused(false)}
      >
        {broken ? (
          // Older stories point at files the server no longer has (404) —
          // docs/BACKEND_BUGS.md #10. Say so instead of showing a black void.
          <p className="text-ig-text-secondary absolute inset-0 flex items-center justify-center px-6 text-center text-sm">
            {t("mediaMissing")}
          </p>
        ) : (
          <Image
            src={url}
            alt=""
            fill
            sizes="420px"
            className="object-contain"
            style={mediaFilter ? { filter: mediaFilter } : undefined}
            priority
            onError={() => setBroken(true)}
          />
        )}

        {/* Text stickers baked into the story, positioned by their 0–1 x/y
            (centre-top when the author left no coordinates). */}
        {overlays.map((overlay, position) =>
          overlay.type === "text" && overlay.value ? (
            <p
              key={position}
              className="pointer-events-none absolute z-[6] max-w-[85%] -translate-x-1/2 -translate-y-1/2 px-2 text-center text-xl font-bold break-words text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]"
              style={{ left: `${(overlay.x ?? 0.5) * 100}%`, top: `${(overlay.y ?? 0.18) * 100}%` }}
            >
              {overlay.value}
            </p>
          ) : null,
        )}

        {/* Music sticker + the track itself, keyed to the slide so it restarts. */}
        {audioSrc ? (
          <>
            {}
            {/* Imported catalogue tracks carry a **signed, expiring** preview
                URL (Deezer's `exp=` 403s after ~a day) and the backend's own
                `/music/{id}/stream` answers 404 for them — the file was never
                stored. Nothing here can re-sign it, so say so instead of
                playing silence. */}
            <audio
              ref={audioRef}
              key={current.id}
              src={audioSrc}
              loop
              onError={() => setAudioBroken(true)}
            />
            {/* Cleared above the reply bar — at `bottom-4` the pill landed on
                top of the input on anyone else's story. */}
            <div
              className={cn(
                "pointer-events-none absolute left-1/2 z-[6] flex max-w-[80%] -translate-x-1/2 items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 backdrop-blur-sm",
                isMine ? "bottom-4" : "bottom-20",
              )}
            >
              {music?.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- external album art, hosts vary
                <img src={music.coverUrl} alt="" className="size-6 shrink-0 rounded object-cover" />
              ) : (
                <Music2 className="size-4 shrink-0 text-white" />
              )}
              <span className="truncate text-xs font-semibold text-white">
                {music?.title}
                {music?.artist ? ` · ${music.artist}` : ""}
              </span>
              {audioBroken ? (
                <span className="shrink-0 text-[10px] text-white/60">
                  {tErrors("audioUnavailableShort")}
                </span>
              ) : null}
            </div>
          </>
        ) : null}

        {/* "Add Yours" chain badge — anyone can jump into the relay from here. */}
        {current.addYoursPromptId ? (
          <Link
            href={ROUTES.addYours(current.addYoursPromptId)}
            onClick={onClose}
            className="pointer-events-auto absolute top-16 left-1/2 z-[6] -translate-x-1/2 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm"
          >
            {t("addYoursBadge")}
          </Link>
        ) : null}

        <StoryStickerLayer storyId={current.id} isMine={isMine} onBusyChange={setStickerBusy} />

        <button
          type="button"
          aria-label={tCommon("previous")}
          onClick={previous}
          className="absolute inset-y-0 left-0 w-1/3"
        />
        <button
          type="button"
          aria-label={tCommon("next")}
          onClick={next}
          className="absolute inset-y-0 right-0 w-1/3"
        />

        <ChevronLeft className="pointer-events-none absolute top-1/2 left-1 size-6 -translate-y-1/2 text-white/60" />
        <ChevronRight className="pointer-events-none absolute top-1/2 right-1 size-6 -translate-y-1/2 text-white/60" />
      </div>

      {/* Only my own story gets its own footer row; on someone else's the like
          heart lives inside the reply bar, which is what covers the bottom. */}
      {isMine ? (
        <div className="flex items-center gap-4 px-4 py-3">
          <button
            type="button"
            onClick={() => setViewersOpen(true)}
            className="flex items-center gap-2 text-sm text-white"
          >
            <Eye className="size-5" />
            {t("viewers")}
          </button>
        </div>
      ) : null}

      {isMine ? (
        <>
          <StoryViewersDialog
            storyId={current.id}
            open={viewersOpen}
            onOpenChange={setViewersOpen}
          />
          <StoryInsightsDialog
            storyId={current.id}
            open={insightsOpen}
            onOpenChange={setInsightsOpen}
          />
          {!current.addYoursPromptId ? (
            <CreateAddYoursDialog
              storyId={current.id}
              open={addYoursOpen}
              onOpenChange={setAddYoursOpen}
            />
          ) : null}
        </>
      ) : null}

      {/* Only on someone else's story: replying to yourself is not a thing. */}
      {isMine ? null : (
        <StoryReplyBar
          storyId={current.id}
          authorName={author?.userName ?? ""}
          onInteractionStart={() => setReplying(true)}
          onInteractionEnd={() => setReplying(false)}
          trailing={
            <button
              type="button"
              aria-label={t("likeStory")}
              aria-pressed={current.isLiked}
              onClick={() => likeStory.mutate(current.id)}
              className={cn(
                "shrink-0 transition-transform active:scale-90",
                current.isLiked ? "text-ig-danger" : "text-white",
              )}
            >
              <HeartIcon filled={current.isLiked} className="size-6" />
            </button>
          }
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t("deleteStory")}
        description={t("deleteStoryConfirm")}
        confirmLabel={tCommon("delete")}
        onConfirm={() => deleteStory.mutate(current.id, { onSuccess: onClose })}
      />
    </div>
  );
}
