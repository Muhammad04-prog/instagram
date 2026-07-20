"use client";

import { Pause, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const BAR_COUNT = 28;

/**
 * A decorative but stable "waveform" — seeded by the message id so it does
 * not reshuffle on every re-render. Real per-sample amplitude analysis isn't
 * worth it for a few seconds of voice; IG's own bars aren't the real signal
 * either.
 */
function barHeights(seed: number): number[] {
  let x = seed || 1;
  const next = () => {
    x = (x * 1103515245 + 12345) & 0x7fffffff;
    return (x % 1000) / 1000;
  };
  return Array.from({ length: BAR_COUNT }, () => 0.35 + next() * 0.65);
}

function formatTime(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/** IG's voice-note bubble: play button, waveform, duration — replaces the bare browser `<audio>` widget. */
export function VoiceMessagePlayer({
  src,
  seed,
  durationHint,
  onError,
}: {
  src: string;
  /** Message id — seeds the waveform bars. */
  seed: number;
  /** `MessageDto.duration`, shown before the file's own metadata has loaded. */
  durationHint?: number | null;
  onError?: () => void;
}) {
  const t = useTranslations("chat");
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(durationHint ?? 0);
  const [bars] = useState(() => barHeights(seed));

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => {
      setPlaying(false);
      setProgress(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      void audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
  };

  const activeBars = Math.round(progress * BAR_COUNT);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={playing ? t("pause") : t("play")}
      className="flex w-56 items-center gap-2.5 px-1 py-1"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-current/15">
        {playing ? (
          <Pause className="size-3.5 fill-current" />
        ) : (
          <Play className="ml-0.5 size-3.5 fill-current" />
        )}
      </span>

      <span className="flex h-6 flex-1 items-center gap-[3px] overflow-hidden">
        {bars.map((height, index) => (
          <span
            key={index}
            style={{ height: `${height * 100}%` }}
            className={cn(
              "w-[2.5px] shrink-0 rounded-full bg-current transition-opacity",
              index < activeBars ? "opacity-100" : "opacity-35",
            )}
          />
        ))}
      </span>

      <span className="shrink-0 text-[11px] tabular-nums">{formatTime(duration)}</span>

      <audio ref={audioRef} src={src} preload="metadata" className="hidden" onError={onError} />
    </button>
  );
}
