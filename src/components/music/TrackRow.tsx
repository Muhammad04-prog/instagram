"use client";

import { Bookmark, Pause, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useToggleSaveMusic } from "@/hooks/useMusic";
import { cn, formatCount, getImageUrl } from "@/lib/utils";
import { usePlayerStore } from "@/store/player.store";
import type { MusicDto } from "@/types/api.types";

const formatDuration = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

/** One track in any list. Playing it hands the whole list to the player as the queue. */
export function TrackRow({ track, queue }: { track: MusicDto; queue: MusicDto[] }) {
  const t = useTranslations("music");
  const play = usePlayerStore((state) => state.play);
  const current = usePlayerStore((state) => state.track);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const save = useToggleSaveMusic();

  const active = current?.id === track.id;
  const showPause = active && isPlaying;
  const cover = getImageUrl(track.coverUrl);

  return (
    <li className="flex items-center gap-3 py-2">
      <button
        type="button"
        onClick={() => play(track, queue)}
        aria-label={showPause ? t("pause") : t("playTrack", { title: track.title })}
        className="relative shrink-0"
      >
        {cover ? (
          <Image
            src={cover}
            alt=""
            width={48}
            height={48}
            className="size-12 rounded object-cover"
          />
        ) : (
          <span className="bg-ig-button-secondary block size-12 rounded" />
        )}
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded bg-black/40",
            active ? "opacity-100" : "opacity-0 hover:opacity-100",
          )}
        >
          {showPause ? (
            <Pause className="size-5 fill-white text-white" />
          ) : (
            <Play className="size-5 fill-white text-white" />
          )}
        </span>
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm",
            active ? "text-ig-primary font-semibold" : "text-ig-text",
          )}
        >
          {track.title}
        </p>
        <p className="text-ig-text-secondary truncate text-xs">
          {track.artist} · {formatDuration(track.duration)}
          {track.usesCount > 0 ? ` · ${t("uses", { count: formatCount(track.usesCount) })}` : ""}
        </p>
      </div>

      <button
        type="button"
        onClick={() => save.mutate(track)}
        aria-label={track.isSaved ? t("unsave") : t("save")}
        aria-pressed={track.isSaved}
        className="text-ig-text shrink-0 p-2"
      >
        <Bookmark className={cn("size-5", track.isSaved && "fill-current")} />
      </button>
    </li>
  );
}
