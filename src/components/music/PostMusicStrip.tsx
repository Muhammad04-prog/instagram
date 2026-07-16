"use client";

import { Music2, Pause } from "lucide-react";
import { useTranslations } from "next-intl";
import { musicService } from "@/services/music.service";
import { usePlayerStore } from "@/store/player.store";
import type { PostMusicDto } from "@/types/api.types";

/**
 * The audio line on a post — what IG puts under the picture when a post has a
 * sound, and what nothing in this app showed before: `PostDto.music` was
 * arriving and being dropped on the floor.
 *
 * `PostMusicDto` is a trimmed track: it has no `duration`, `isSaved` or
 * `usesCount`, so it cannot feed the player as-is. Tapping fetches the full
 * `MusicDto` by id and hands *that* over — which is the only honest use for
 * `GET /music/{id}` in the app.
 */
export function PostMusicStrip({ music }: { music: PostMusicDto }) {
  const t = useTranslations("music");
  const play = usePlayerStore((state) => state.play);
  const current = usePlayerStore((state) => state.track);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const toggle = usePlayerStore((state) => state.toggle);

  const active = current?.id === music.id;

  const start = async () => {
    if (active) {
      toggle();
      return;
    }
    // A post is not a queue: this track plays alone, and "next" has nowhere to
    // go — which is right, one post is one sound.
    const full = await musicService.getById(music.id);
    play(full);
  };

  return (
    <button
      type="button"
      onClick={() => void start()}
      className="text-ig-text flex w-full items-center gap-2 py-1 text-xs"
    >
      {active && isPlaying ? (
        <Pause className="size-3.5 shrink-0 fill-current" />
      ) : (
        <Music2 className="size-3.5 shrink-0" />
      )}
      {/* IG marquees a long title; truncation is the honest small-screen answer. */}
      <span className="truncate">
        {music.title} · {music.artist}
      </span>
      <span className="text-ig-text-secondary ml-auto shrink-0">
        {active && isPlaying ? t("pause") : t("play")}
      </span>
    </button>
  );
}
