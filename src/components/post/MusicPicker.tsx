"use client";

import { useQuery } from "@tanstack/react-query";
import { Music, Pause, Play, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useOnlineMusicProviders,
  useOnlineMusicSearch,
  useSaveOnlineTrack,
} from "@/hooks/useMusic";
import { SEARCH_DEBOUNCE_MS } from "@/lib/constants";
import { musicService } from "@/services/music.service";
import { pageItems } from "@/lib/cursor";
import { getImageUrl } from "@/lib/utils";
import type { MusicDto, OnlineTrackDto } from "@/types/api.types";

/** Either a track we already have, or one still living only in an external catalogue. */
type PickerTrack = { key: string; source: MusicDto } | { key: string; source: OnlineTrackDto };

const isOnline = (track: PickerTrack["source"]): track is OnlineTrackDto => "provider" in track;

/**
 * "Add music" — `musicId` on `POST /posts`.
 *
 * Empty query shows Trending, as IG does; typing searches title and artist —
 * both our own library AND, once there's a term, an external catalogue
 * (Spotify/Deezer) for whatever we don't have, same as real IG's "search any
 * song". Tracks can be previewed inline: `streamUrl`/`previewUrl` honours
 * Range, so a plain <audio> seeks fine. Softclub had no music at all.
 */
export function MusicPicker({
  value,
  onChange,
}: {
  value: MusicDto | null;
  onChange: (music: MusicDto | null) => void;
}) {
  const t = useTranslations("post");
  const [term, setTerm] = useState("");
  const debounced = useDebounce(term.trim(), SEARCH_DEBOUNCE_MS);
  const [playing, setPlaying] = useState<string | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const saveOnline = useSaveOnlineTrack();

  // Two sources, two shapes: search paginates and answers with an envelope,
  // trending returns the rows outright. `pageItems` reads either.
  const { data } = useQuery({
    queryKey: ["music", debounced],
    queryFn: () =>
      debounced
        ? musicService.search({ q: debounced, limit: 10 })
        : musicService.getTrending({ limit: 10 }),
    select: pageItems<MusicDto>,
  });

  // Only once there's a term to search — an external catalogue has no
  // "trending" of its own to show on an empty query.
  const { data: providersData } = useOnlineMusicProviders();
  const hasOnlineProvider = (providersData?.providers.length ?? 0) > 0;
  const { data: onlineData } = useOnlineMusicSearch(debounced, hasOnlineProvider);
  // Already-imported external tracks would just duplicate a row our own search
  // is already showing — only surface the ones we genuinely don't have yet.
  const onlineTracks = (onlineData ?? []).filter((track) => track.musicId === null);

  // One <audio> for the whole list, and it must die with the component —
  // otherwise a preview keeps playing after the dialog closes.
  useEffect(() => {
    return () => {
      audio.current?.pause();
      audio.current = null;
    };
  }, []);

  const toggle = (track: PickerTrack) => {
    if (playing === track.key) {
      audio.current?.pause();
      setPlaying(null);
      return;
    }

    // A track from an external catalogue has no `streamUrl` — there is no full
    // mp3 of it here, only the catalogue's 30-second `previewUrl`. Either can be
    // absent, and then there is simply nothing to play.
    const source = isOnline(track.source)
      ? track.source.previewUrl
      : (track.source.streamUrl ?? track.source.previewUrl);
    if (!source) return;

    audio.current?.pause();
    audio.current = new Audio(source);
    void audio.current
      .play()
      .then(() => setPlaying(track.key))
      .catch(() => setPlaying(null));
  };

  const select = (track: PickerTrack) => {
    audio.current?.pause();
    setPlaying(null);

    if (isOnline(track.source)) {
      const { provider, externalId } = track.source;
      saveOnline.mutate(
        { provider, externalId },
        {
          onSuccess: (music) => {
            onChange(music);
            setTerm("");
          },
        },
      );
      return;
    }

    onChange(track.source);
    setTerm("");
  };

  if (value) {
    return (
      <div className="border-ig-separator flex items-center gap-2 border-t py-3">
        <Music className="text-ig-text size-4 shrink-0" />
        <span className="text-ig-text flex-1 truncate text-sm">
          {value.title} · <span className="text-ig-text-secondary">{value.artist}</span>
        </span>
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label={t("removeMusic")}
          className="text-ig-text-secondary hover:text-ig-text"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  const savedTracks: PickerTrack[] = (data ?? []).map((track) => ({
    key: `saved-${track.id}`,
    source: track,
  }));
  const externalTracks: PickerTrack[] = onlineTracks.map((track) => ({
    key: `online-${track.provider}-${track.externalId}`,
    source: track,
  }));
  const tracks = [...savedTracks, ...externalTracks];

  return (
    <div className="border-ig-separator relative border-t py-3">
      <div className="flex items-center gap-2">
        <Music className="text-ig-text-secondary size-4 shrink-0" />
        <input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder={t("addMusic")}
          aria-label={t("addMusic")}
          className="text-ig-text placeholder:text-ig-text-secondary flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      {tracks.length > 0 ? (
        <ul className="bg-ig-elevated border-ig-separator absolute right-0 left-0 z-10 mt-2 max-h-64 overflow-y-auto rounded-lg border shadow-lg">
          {!debounced ? (
            <li className="text-ig-text-secondary px-3 pt-2 text-xs font-semibold">
              {t("trendingMusic")}
            </li>
          ) : null}

          {savedTracks.map((track) => (
            <MusicPickerRow
              key={track.key}
              track={track}
              playing={playing === track.key}
              onToggle={() => toggle(track)}
              onSelect={() => select(track)}
              playLabel={t("play")}
              pauseLabel={t("pause")}
            />
          ))}

          {externalTracks.length > 0 ? (
            <li className="text-ig-text-secondary px-3 pt-2 text-xs font-semibold">
              {t("moreTracks")}
            </li>
          ) : null}

          {externalTracks.map((track) => (
            <MusicPickerRow
              key={track.key}
              track={track}
              playing={playing === track.key}
              onToggle={() => toggle(track)}
              onSelect={() => select(track)}
              playLabel={t("play")}
              pauseLabel={t("pause")}
            />
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function MusicPickerRow({
  track,
  playing,
  onToggle,
  onSelect,
  playLabel,
  pauseLabel,
}: {
  track: PickerTrack;
  playing: boolean;
  onToggle: () => void;
  onSelect: () => void;
  playLabel: string;
  pauseLabel: string;
}) {
  const { title, artist, coverUrl } = track.source;

  return (
    <li className="hover:bg-ig-bg-secondary flex items-center gap-2 px-3 py-2">
      <button
        type="button"
        onClick={onToggle}
        aria-label={playing ? pauseLabel : playLabel}
        className="text-ig-text shrink-0"
      >
        {coverUrl ? (
          <span className="relative block size-9 overflow-hidden rounded">
            <Image
              src={getImageUrl(coverUrl) ?? ""}
              alt=""
              fill
              sizes="36px"
              className="object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/40">
              {playing ? (
                <Pause className="size-3 text-white" />
              ) : (
                <Play className="size-3 text-white" />
              )}
            </span>
          </span>
        ) : playing ? (
          <Pause className="size-4" />
        ) : (
          <Play className="size-4" />
        )}
      </button>

      <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
        <span className="text-ig-text block truncate text-sm font-semibold">{title}</span>
        <span className="text-ig-text-secondary block truncate text-xs">{artist}</span>
      </button>
    </li>
  );
}
