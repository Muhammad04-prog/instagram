"use client";

import type { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { TrackRow } from "@/components/music/TrackRow";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/useDebounce";
import { useMusicSearch, useSavedMusic, useTrendingMusic } from "@/hooks/useMusic";
import { SEARCH_DEBOUNCE_MS } from "@/lib/constants";
import type { MusicDto } from "@/types/api.types";

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

      {debounced ? (
        <SearchResults term={debounced} />
      ) : (
        <Tabs defaultValue="trending">
          <TabsList
            variant="line"
            className="border-ig-separator mb-2 h-auto w-full justify-start gap-8 rounded-none border-b bg-transparent p-0"
          >
            {(["trending", "saved"] as const).map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="text-ig-text-secondary data-active:text-ig-text data-active:border-b-ig-text flex-none rounded-none border-b-2 border-b-transparent py-3 text-sm font-semibold"
              >
                {t(tab)}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="trending">
            <TrendingList />
          </TabsContent>
          <TabsContent value="saved">
            <SavedList />
          </TabsContent>
        </Tabs>
      )}
    </div>
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
 */
type ListQuery = UseInfiniteQueryResult<InfiniteData<MusicDto[], unknown>, Error>;

/** All three lists are the same list with a different source. */
function TrackList({ query, empty }: { query: ListQuery; empty: string }) {
  const t = useTranslations("music");
  const tracks = query.data?.pages.flat() ?? [];

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
