"use client";

import { Hash, MapPin, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { SearchUserRow } from "@/components/search/SearchUserRow";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import {
  useAddSearchHistory,
  useAddUserSearchHistory,
  useClearSearchHistories,
  useDeleteSearchHistory,
  useDeleteUserSearchHistory,
  useSearchHistories,
  useUserSearchHistories,
} from "@/hooks/useUserSearch";
import { useSearch } from "@/hooks/useSearch";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { formatCount } from "@/lib/utils";
import type { UserBriefDto } from "@/types/api.types";

/**
 * The body shared by the sidebar SearchPanel and the /explore search dropdown:
 * "Recent" while the query is empty, live results while it is not.
 *
 * "Recent" merges the two histories the API keeps separately (typed queries and
 * visited profiles). Neither carries a timestamp, and their ids come from
 * different sequences, so a true chronological merge is impossible — accounts
 * are listed first, then typed queries, each newest-first within its group.
 */
export function SearchResults({
  term,
  debouncedTerm,
  onPickTerm,
  onNavigate,
}: {
  /** What is in the input right now — committed to history on selection. */
  term: string;
  debouncedTerm: string;
  onPickTerm: (text: string) => void;
  onNavigate: () => void;
}) {
  const t = useTranslations("search");
  const [confirmClear, setConfirmClear] = useState(false);

  const searching = debouncedTerm.length > 0;

  const results = useSearch(debouncedTerm, searching);
  const textHistory = useSearchHistories();
  const userHistory = useUserSearchHistories();

  const addText = useAddSearchHistory();
  const addUser = useAddUserSearchHistory();
  const deleteText = useDeleteSearchHistory();
  const deleteUser = useDeleteUserSearchHistory();
  const clearAll = useClearSearchHistories();

  /** Selecting an account records both the visit and the query that found it. */
  const handleSelect = (user: UserBriefDto) => {
    addUser.mutate(user.id);
    const text = term.trim();
    if (text) addText.mutate(text);
    onNavigate();
  };

  if (searching) {
    if (results.isPending) return <Loader className="py-10" />;
    if (results.isError) return <ErrorState onRetry={() => void results.refetch()} />;

    // One response, three kinds. Phase 8 could only search accounts —
    // softclub had neither hashtags nor place search.
    const { users = [], hashtags = [], locations = [] } = results.data ?? {};
    const nothing = users.length === 0 && hashtags.length === 0 && locations.length === 0;

    if (nothing) {
      return (
        <p className="text-ig-text-secondary px-6 py-10 text-center text-sm">{t("noResults")}</p>
      );
    }

    return (
      <ul className="py-2">
        {users.map((user) => (
          <SearchUserRow key={user.id} user={user} onSelect={handleSelect} />
        ))}

        {hashtags.map((hashtag) => (
          <li key={`h${hashtag.id}`}>
            <Link
              href={ROUTES.hashtag(hashtag.name)}
              onClick={onNavigate}
              className="hover:bg-ig-bg-secondary flex items-center gap-3 px-6 py-2"
            >
              <span className="bg-ig-button-secondary text-ig-text flex size-11 shrink-0 items-center justify-center rounded-full">
                <Hash className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="text-ig-text block truncate text-sm font-semibold">
                  #{hashtag.name}
                </span>
                <span className="text-ig-text-secondary block text-sm">
                  {t("postsCount", { count: formatCount(hashtag.postsCount) })}
                </span>
              </span>
            </Link>
          </li>
        ))}

        {locations.map((location) => (
          <li key={`l${location.id}`}>
            <Link
              href={ROUTES.location(location.id)}
              onClick={onNavigate}
              className="hover:bg-ig-bg-secondary flex items-center gap-3 px-6 py-2"
            >
              <span className="bg-ig-button-secondary text-ig-text flex size-11 shrink-0 items-center justify-center rounded-full">
                <MapPin className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="text-ig-text block truncate text-sm font-semibold">
                  {location.city}
                </span>
                <span className="text-ig-text-secondary block truncate text-sm">
                  {[location.state, location.country].filter(Boolean).join(", ")}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  // ---- "Recent" ----------------------------------------------------------
  const isPending = textHistory.isPending || userHistory.isPending;
  const isError = textHistory.isError || userHistory.isError;
  const texts = textHistory.data ?? [];
  const accounts = userHistory.data ?? [];
  const isEmpty = texts.length === 0 && accounts.length === 0;

  // Truly chronological now. Phase 8 had to show accounts, then queries, and say
  // so out loud: softclub's history had no timestamp, and the two kinds came
  // from different id sequences (bug #14). Both carry `createdAt` here.
  const recent = [
    ...accounts.map((row) => ({ kind: "user" as const, at: row.createdAt, row })),
    ...texts.map((row) => ({ kind: "text" as const, at: row.createdAt, row })),
  ].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

  return (
    <div className="py-2">
      <div className="flex items-center justify-between px-6 py-2">
        <h3 className="text-ig-text text-base font-semibold">{t("recent")}</h3>
        {!isEmpty && !isPending ? (
          <ConfirmDialog
            open={confirmClear}
            onOpenChange={setConfirmClear}
            trigger={
              <button
                type="button"
                className="text-ig-primary hover:text-ig-text text-sm font-semibold"
              >
                {t("clearAll")}
              </button>
            }
            title={t("clearAllTitle")}
            description={t("clearAllDescription")}
            confirmLabel={t("clearAll")}
            onConfirm={() => clearAll.mutate()}
          />
        ) : null}
      </div>

      {isPending ? (
        <Loader className="py-10" />
      ) : isError ? (
        <ErrorState
          onRetry={() => {
            void textHistory.refetch();
            void userHistory.refetch();
          }}
        />
      ) : isEmpty ? (
        <p className="text-ig-text-secondary px-6 py-10 text-center text-sm">{t("noRecent")}</p>
      ) : (
        <ul>
          {recent.map((entry) =>
            entry.kind === "user" ? (
              <SearchUserRow
                key={`u${entry.row.id}`}
                user={entry.row.user}
                onSelect={handleSelect}
                onRemove={() => deleteUser.mutate(entry.row.id)}
              />
            ) : (
              <li
                key={`t${entry.row.id}`}
                className="hover:bg-ig-bg-secondary flex items-center gap-3 px-6 py-2"
              >
                <button
                  type="button"
                  onClick={() => onPickTerm(entry.row.text)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span className="bg-ig-button-secondary text-ig-text-secondary flex size-11 shrink-0 items-center justify-center rounded-full">
                    <Search className="size-5" />
                  </span>
                  <span className="text-ig-text min-w-0 truncate text-sm font-semibold">
                    {entry.row.text}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => deleteText.mutate(entry.row.id)}
                  aria-label={t("remove")}
                  className="text-ig-text-secondary hover:text-ig-text shrink-0 p-1"
                >
                  <X className="size-4" />
                </button>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}
