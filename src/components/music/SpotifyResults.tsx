"use client";

import { Check, ExternalLink, Pause, Play, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { useSpotifySearch, useToggleSaveSpotify } from "@/hooks/useSpotify";
import type { SpotifyTrackDto } from "@/types/api.types";

const formatDuration = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

/**
 * Spotify's catalogue, for tracks we do not have yet. Saving imports the track
 * and it becomes an ordinary one of ours.
 *
 * Preview is Spotify's 30-second snippet, played straight from their CDN — it
 * is public, so it needs no proxy, and it is *not* the track: a saved track
 * plays in full through the normal player. Some tracks have no snippet at all
 * (`previewUrl: null`), and those simply get no play button rather than a
 * button that does nothing.
 */
export function SpotifyResults({ term }: { term: string }) {
  const t = useTranslations("music");
  const { data, isPending, isError, refetch } = useSpotifySearch(term);
  // Only one snippet plays at a time; the row that owns it mounts the element.
  const [previewing, setPreviewing] = useState<string | null>(null);

  if (isPending) return <Loader className="py-10" />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;
  if (!data || data.length === 0)
    return <EmptyState title={t("noResults", { term })} className="py-10" />;

  return (
    <>
      <p className="text-ig-text-secondary py-2 text-xs">{t("spotifyNote")}</p>
      <ul className="divide-ig-separator divide-y">
        {data.map((track) => (
          <SpotifyRow
            key={track.spotifyId}
            track={track}
            term={term}
            previewing={previewing === track.spotifyId}
            onPreview={() =>
              setPreviewing((current) => (current === track.spotifyId ? null : track.spotifyId))
            }
          />
        ))}
      </ul>
    </>
  );
}

function SpotifyRow({
  track,
  term,
  previewing,
  onPreview,
}: {
  track: SpotifyTrackDto;
  term: string;
  previewing: boolean;
  onPreview: () => void;
}) {
  const t = useTranslations("music");
  const save = useToggleSaveSpotify(term);

  return (
    <li className="flex items-center gap-3 py-2">
      <span className="relative shrink-0">
        {track.albumCover ? (
          <Image
            src={track.albumCover}
            alt=""
            width={48}
            height={48}
            className="size-12 rounded object-cover"
          />
        ) : (
          <span className="bg-ig-button-secondary block size-12 rounded" />
        )}

        {track.previewUrl ? (
          <button
            type="button"
            onClick={onPreview}
            aria-label={previewing ? t("pause") : t("preview")}
            className="absolute inset-0 flex items-center justify-center rounded bg-black/40 opacity-0 hover:opacity-100 data-[on=true]:opacity-100"
            data-on={previewing}
          >
            {previewing ? (
              <Pause className="size-5 fill-white text-white" />
            ) : (
              <Play className="size-5 fill-white text-white" />
            )}
          </button>
        ) : null}

        {previewing && track.previewUrl ? (
          <audio src={track.previewUrl} autoPlay onEnded={onPreview} />
        ) : null}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-ig-text truncate text-sm">{track.title}</p>
        <p className="text-ig-text-secondary truncate text-xs">
          {track.artist} · {formatDuration(track.durationSec)}
          {track.previewUrl ? ` · ${t("preview30")}` : ` · ${t("noPreview")}`}
        </p>
      </div>

      <a
        href={track.spotifyUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("openInSpotify")}
        className="text-ig-text-secondary shrink-0 p-2"
      >
        <ExternalLink className="size-4" />
      </a>

      <button
        type="button"
        onClick={() => save.mutate(track)}
        disabled={save.isPending}
        className="text-ig-text shrink-0 p-2 disabled:opacity-50"
        aria-label={track.isSaved ? t("unsave") : t("import")}
        aria-pressed={track.isSaved}
      >
        {track.isSaved ? <Check className="size-5" /> : <Plus className="size-5" />}
      </button>
    </li>
  );
}
