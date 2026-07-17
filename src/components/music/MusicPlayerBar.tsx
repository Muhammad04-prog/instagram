"use client";

import { Pause, Play, SkipBack, SkipForward, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useToggleSaveMusic } from "@/hooks/useMusic";
import { useSidebarForcedCollapsed } from "@/hooks/useSidebarState";
import { musicService } from "@/services/music.service";
import { cn, getImageUrl } from "@/lib/utils";
import { usePlayerStore } from "@/store/player.store";

const formatTime = (seconds: number) => {
  const total = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

/**
 * The player bar, mounted once in the layout so a track survives navigation.
 *
 * The `<audio>` element is the source of truth for time and duration — mirroring
 * those into React state would only give two clocks that disagree. The store
 * owns *what* plays; the element owns *where* it is.
 */
export function MusicPlayerBar() {
  const t = useTranslations("music");
  const { track, isPlaying, toggle, close, next, previous } = usePlayerStore();
  const save = useToggleSaveMusic();
  // The bar must clear the sidebar exactly as the content does, or it slides
  // under the rail at ≥1264px.
  const forcedCollapsed = useSidebarForcedCollapsed();

  const audioRef = useRef<HTMLAudioElement>(null);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Play/pause is driven by the store, but the browser can refuse to start
  // (autoplay policy) — if it does, the store must not keep claiming it plays.
  const pause = usePlayerStore((state) => state.pause);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) void audio.play().catch(() => pause());
    else audio.pause();
  }, [isPlaying, track?.id, pause]);

  if (!track) return null;

  const cover = getImageUrl(track.coverUrl);
  // `duration` from the DTO is ffprobe's; the element's is the real file. Prefer
  // the element once it knows, so the scrubber cannot run past the end.
  const total = duration || track.duration;

  return (
    <div
      className={cn(
        "border-ig-border bg-ig-bg bottom-mobilenav md:pl-sidebar-collapsed fixed inset-x-0 z-40 border-t md:bottom-0",
        !forcedCollapsed && "xl:pl-sidebar",
      )}
    >
      <audio
        ref={audioRef}
        // Our own mp3 streams through the proxy with Range, so it seeks. A track
        // imported from an external catalogue has no full file here — only the
        // catalogue's 30-second preview, which is all `isFullTrack: false` means.
        src={track.isFullTrack ? musicService.streamUrl(track.id) : (track.previewUrl ?? undefined)}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onEnded={() => next()}
      />

      <div className="mx-auto flex max-w-[935px] items-center gap-3 px-4 py-2">
        {cover ? (
          <Image
            src={cover}
            alt=""
            width={44}
            height={44}
            className="size-11 shrink-0 rounded object-cover"
          />
        ) : (
          <span className="bg-ig-button-secondary size-11 shrink-0 rounded" />
        )}

        <div className="min-w-0 flex-1">
          <p className="text-ig-text truncate text-sm font-semibold">{track.title}</p>
          <p className="text-ig-text-secondary truncate text-xs">{track.artist}</p>
        </div>

        <div className="flex items-center gap-1">
          <button type="button" onClick={previous} aria-label={t("previous")} className="p-2">
            <SkipBack className="text-ig-text size-4" />
          </button>
          <button type="button" onClick={toggle} aria-label={isPlaying ? t("pause") : t("play")}>
            <span className="bg-ig-text text-ig-bg flex size-8 items-center justify-center rounded-full">
              {isPlaying ? (
                <Pause className="size-4 fill-current" />
              ) : (
                <Play className="size-4 fill-current" />
              )}
            </span>
          </button>
          <button type="button" onClick={next} aria-label={t("next")} className="p-2">
            <SkipForward className="text-ig-text size-4" />
          </button>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-ig-text-secondary w-9 text-right text-[11px] tabular-nums">
            {formatTime(time)}
          </span>
          <input
            type="range"
            min={0}
            max={total || 0}
            value={time}
            step={1}
            aria-label={t("seek")}
            onChange={(event) => {
              const to = Number(event.target.value);
              // Seeking is the element's job — set it there and let timeupdate
              // report back, so the thumb never drifts from the audio.
              if (audioRef.current) audioRef.current.currentTime = to;
              setTime(to);
            }}
            className="accent-ig-text h-1 w-40"
          />
          <span className="text-ig-text-secondary w-9 text-[11px] tabular-nums">
            {formatTime(total)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => save.mutate(track)}
          className={cn(
            "hidden text-xs font-semibold sm:block",
            track.isSaved ? "text-ig-text-secondary" : "text-ig-primary",
          )}
        >
          {track.isSaved ? t("savedState") : t("save")}
        </button>

        <button type="button" onClick={close} aria-label={t("closePlayer")} className="p-1">
          <X className="text-ig-text-secondary size-4" />
        </button>
      </div>
    </div>
  );
}
