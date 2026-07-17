"use client";

import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Pause,
  Play,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { HeartIcon } from "@/components/icons";
import { StoryViewersSheet } from "@/components/story/StoryViewersSheet";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useAuth } from "@/hooks/useAuth";
import { useDeleteStory, useLikeStory, useMarkStorySeen, useUserStories } from "@/hooks/useStories";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { cn, getImageUrl } from "@/lib/utils";
import { isVideo } from "@/types/post.types";

const SLIDE_MS = 5000;
const TICK_MS = 50;

/**
 * Full-screen viewer: one progress bar per slide (5s each), tap left/right,
 * hold to pause, ←/→ to move, Space to pause, Esc to close. No reference
 * screenshot exists (docs/screenshots/INDEX.md §5) — this follows live IG.
 */
export function StoryViewer({ userId, onClose }: { userId: string; onClose: () => void }) {
  const t = useTranslations("story");
  const tPost = useTranslations("post");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const { user } = useAuth();

  const { data, isPending, isError, refetch } = useUserStories(userId);
  const markSeen = useMarkStorySeen();
  const likeStory = useLikeStory();
  const deleteStory = useDeleteStory();

  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [viewersOpen, setViewersOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [broken, setBroken] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const stories = data?.stories ?? [];
  const current = stories[index];
  const isMine = userId === user?.userId;
  const currentIsVideo = current ? isVideo(current.fileName) : false;

  // `onClose` (→ router.push) must NOT run inside the setIndex updater: React
  // invokes updater functions during render, so calling a router action there
  // trips "Cannot update a component (Router) while rendering StoryViewer".
  // Checking the bound first and calling onClose as a plain side effect keeps
  // the router update outside React's render phase.
  const next = useCallback(() => {
    if (index + 1 >= stories.length) {
      onClose();
      return;
    }
    setProgress(0);
    setBroken(false);
    setIndex(index + 1);
  }, [index, stories.length, onClose]);

  const previous = useCallback(() => {
    setProgress(0);
    setBroken(false);
    setIndex((position) => Math.max(0, position - 1));
  }, []);

  // Each slide counts as a view exactly once (add-story-view + grey ring).
  useEffect(() => {
    if (current) markSeen(current.id);
  }, [current, markSeen]);

  // Image slides: fixed 5s progress bar. Video slides drive their own progress
  // (below) off real playback time, so this timer sits out.
  useEffect(() => {
    if (!current || currentIsVideo || paused || viewersOpen || confirmOpen) return;

    const timer = window.setInterval(() => {
      setProgress((value) => {
        if (value + TICK_MS >= SLIDE_MS) {
          next();
          return 0;
        }
        return value + TICK_MS;
      });
    }, TICK_MS);

    return () => window.clearInterval(timer);
  }, [current, currentIsVideo, paused, viewersOpen, confirmOpen, next]);

  // Video slides: progress bar tracks real playback time, advance on `ended`
  // rather than a fixed 5s guess.
  useEffect(() => {
    if (!currentIsVideo) return;
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (video.duration) setProgress((video.currentTime / video.duration) * SLIDE_MS);
    };
    const onEnded = () => next();

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
    };
  }, [currentIsVideo, current, next]);

  // Hold-to-pause / the header play-pause button both flow through `paused` —
  // keep the video element's actual playback state in sync with it.
  useEffect(() => {
    if (!currentIsVideo) return;
    const video = videoRef.current;
    if (!video) return;
    if (paused || viewersOpen || confirmOpen) video.pause();
    else void video.play().catch(() => {});
  }, [currentIsVideo, paused, viewersOpen, confirmOpen, current]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = muted;
  }, [muted, current]);

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

  const url = getImageUrl(current.fileName) ?? "";

  return (
    <div className="relative mx-auto flex h-[90vh] w-[420px] max-w-[95vw] flex-col overflow-hidden rounded-lg bg-black">
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
        <Link href={ROUTES.profile(data.userId)} onClick={onClose}>
          <UserAvatar src={data.userImage} alt={data.userName} size={32} />
        </Link>
        <Link
          href={ROUTES.profile(data.userId)}
          onClick={onClose}
          className="text-sm font-semibold text-white"
        >
          {data.userName}
        </Link>
        <time
          dateTime={current.createAt}
          className="text-xs text-white/70"
          suppressHydrationWarning
        >
          {format.relativeTime(new Date(current.createAt), new Date())}
        </time>

        <div className="ml-auto flex items-center gap-3">
          {currentIsVideo ? (
            <>
              <button
                type="button"
                aria-label={muted ? tPost("unmute") : tPost("mute")}
                onClick={() => setMuted((value) => !value)}
                className="text-white/90 hover:text-white"
              >
                {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
              </button>
              <button
                type="button"
                aria-label={paused ? t("play") : t("pause")}
                onClick={() => setPaused((value) => !value)}
                className="text-white/90 hover:text-white"
              >
                {paused ? <Play className="size-5" /> : <Pause className="size-5" />}
              </button>
            </>
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
          <button
            type="button"
            aria-label={tCommon("close")}
            onClick={onClose}
            className="text-white/90 hover:text-white"
          >
            <X className="size-6" />
          </button>
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
        ) : currentIsVideo ? (
          <video
            key={current.id}
            ref={videoRef}
            src={url}
            muted={muted}
            playsInline
            autoPlay
            className="absolute inset-0 size-full object-contain"
            onError={() => setBroken(true)}
          />
        ) : (
          <Image
            key={current.id}
            src={url}
            alt=""
            fill
            sizes="420px"
            className="object-contain"
            priority
            onError={() => setBroken(true)}
          />
        )}

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

      <div className="flex items-center gap-4 px-4 py-3">
        {isMine ? (
          <button
            type="button"
            onClick={() => setViewersOpen(true)}
            className="flex items-center gap-2 text-sm text-white"
          >
            <Eye className="size-5" />
            {t("viewers")}
          </button>
        ) : (
          <button
            type="button"
            aria-label={t("likeStory")}
            aria-pressed={current.liked}
            onClick={() => likeStory.mutate(current.id)}
            className={cn(
              "transition-transform active:scale-90",
              current.liked ? "text-ig-danger" : "text-white",
            )}
          >
            <HeartIcon filled={current.liked} className="size-7" />
          </button>
        )}
      </div>

      {isMine ? (
        <StoryViewersSheet storyId={current.id} open={viewersOpen} onOpenChange={setViewersOpen} />
      ) : null}

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
