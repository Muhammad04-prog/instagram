"use client";

import type { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { SpotifyResults } from "@/components/music/SpotifyResults";
import { TrackRow } from "@/components/music/TrackRow";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/useDebounce";
import { useMusicSearch, useSavedMusic, useTrendingMusic } from "@/hooks/useMusic";
import { SEARCH_DEBOUNCE_MS } from "@/lib/constants";
import type { MusicDto } from "@/types/api.types";
import { flattenPages, type Page } from "@/lib/cursor";

/**
 * Music: what is trending, what you searched for, and what you saved.
 *
 * Search replaces the trending tab while there is a term, the way IG's audio
 * browser does — a separate results area would leave the screen half empty.
 */
export function MusicScreen() {
  const t = useTranslations("music");
  const [term, setTerm] = useState("");
  const debounced = useDebounce(term.trim(), SEARCH_DEBOUNCE_MS);

  return (
    <div className="mx-auto w-full max-w-[640px] space-y-4 py-4">
      <h1 className="text-ig-text text-xl font-bold">{t("title")}</h1>

      <input
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder={t("searchPlaceholder")}
        aria-label={t("searchPlaceholder")}
        className="bg-ig-button-secondary text-ig-text placeholder:text-ig-text-secondary h-10 w-full rounded-lg px-4 text-sm outline-none"
      />

      {/* Searching swaps the tabs rather than the whole screen: the same term
          asks two catalogues — ours, and Spotify's for what we do not have. */}
      {debounced ? (
        <MusicTabs
          tabs={[
            { value: "library", content: <SearchResults term={debounced} /> },
            { value: "spotify", content: <SpotifyResults term={debounced} /> },
          ]}
        />
      ) : (
        <MusicTabs
          tabs={[
            { value: "trending", content: <TrendingList /> },
            { value: "saved", content: <SavedList /> },
          ]}
        />
      )}
    </div>
  );
}

/** The tab strip is the same in both modes; only what it holds changes. */
function MusicTabs({ tabs }: { tabs: { value: string; content: ReactNode }[] }) {
  const t = useTranslations("music");

  return (
    <Tabs defaultValue={tabs[0]?.value}>
      <TabsList
        variant="line"
        className="border-ig-separator mb-2 h-auto w-full justify-start gap-8 rounded-none border-b bg-transparent p-0"
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="text-ig-text-secondary data-active:text-ig-text data-active:border-b-ig-text flex-none rounded-none border-b-2 border-b-transparent py-3 text-sm font-semibold"
          >
            {t(tab.value)}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

function TrendingList() {
  const t = useTranslations("music");
  const query = useTrendingMusic();
  return <TrackList query={query} empty={t("noTrending")} />;
}

function SavedList() {
  const t = useTranslations("music");
  const query = useSavedMusic();
  return <TrackList query={query} empty={t("noSaved")} />;
}

function SearchResults({ term }: { term: string }) {
  const t = useTranslations("music");
  const query = useMusicSearch(term);
  return <TrackList query={query} empty={t("noResults", { term })} />;
}

/**
 * Every list here is an infinite query over tracks. The page param is left
 * `unknown`: this component never touches it, only the hooks do.
 *
 * A page is `Page<MusicDto>` or a bare array depending on the source — `/music`
 * paginates and answers with an envelope, `/music/trending` and
 * `/profile/me/saved-music` return the rows outright. `flattenPages` reads both,
 * so the list itself does not care which one it was handed.
 */
type ListQuery = UseInfiniteQueryResult<InfiniteData<Page<MusicDto> | MusicDto[], unknown>, Error>;

/** All three lists are the same list with a different source. */
function TrackList({ query, empty }: { query: ListQuery; empty: string }) {
  const t = useTranslations("music");
  const tracks = flattenPages(query.data);

  if (query.isPending) return <Loader className="py-10" />;
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;
  if (tracks.length === 0) return <EmptyState title={empty} className="py-10" />;

  return (
    <>
      <ul className="divide-ig-separator divide-y">
        {tracks.map((track) => (
          // The queue is the whole list, so "next" walks the list you are looking at.
          <TrackRow key={track.id} track={track} queue={tracks} />
        ))}
      </ul>

      {query.hasNextPage ? (
        <button
          type="button"
          onClick={() => void query.fetchNextPage()}
          disabled={query.isFetchingNextPage}
          className="text-ig-primary mt-4 text-sm font-semibold disabled:opacity-50"
        >
          {t("loadMore")}
        </button>
      ) : null}
    </>
  );
}
