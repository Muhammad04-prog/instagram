"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { SettingsUnavailableNotice } from "@/components/settings/SettingsRow";
import { SettingsToggleRow } from "@/components/settings/SettingsToggleRow";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";

/**
 * Settings → Скрытые слова (img19). `hiddenWords` is a single flat list on
 * the backend — it has no separate on/off switch for "in comments" vs. "in
 * requests" the way real IG's filter does, so those toggles stay local-only
 * exactly as before. The word list itself is real now.
 */
export function HiddenWordsSettings() {
  const t = useTranslations("settings");
  const [hideComments, setHideComments] = useState(true);
  const [advancedFilter, setAdvancedFilter] = useState(true);
  const [hideRequests, setHideRequests] = useState(true);
  const [draft, setDraft] = useState("");

  const { data: settings, isPending, isError, refetch } = useSettings();
  const update = useUpdateSettings();

  if (isPending) return <Loader className="py-10" />;
  if (isError || !settings) return <ErrorState onRetry={() => void refetch()} />;

  const words = settings.hiddenWords;

  const addWord = () => {
    const word = draft.trim();
    if (!word || words.includes(word)) return;
    update.mutate({ hiddenWords: [...words, word] });
    setDraft("");
  };

  const removeWord = (word: string) => {
    update.mutate({ hiddenWords: words.filter((existing) => existing !== word) });
  };

  return (
    <div className="max-w-[640px] space-y-10">
      <h2 className="text-ig-text text-lg font-bold">{t("hiddenWords")}</h2>

      <section className="space-y-3">
        <h3 className="text-ig-text text-base font-semibold">{t("hiddenWordsUnwanted")}</h3>
        <SettingsUnavailableNotice>{t("acComingSoon")}</SettingsUnavailableNotice>
        <div className="space-y-4">
          <SettingsToggleRow
            title={t("hideComments")}
            description={t("hideCommentsHint")}
            checked={hideComments}
            onCheckedChange={setHideComments}
            disabled
          />
          <SettingsToggleRow
            title={t("advancedFilter")}
            description={t("advancedFilterHint")}
            checked={advancedFilter}
            onCheckedChange={setAdvancedFilter}
            disabled
          />
          <SettingsToggleRow
            title={t("hideRequests")}
            description={t("hideRequestsHint")}
            checked={hideRequests}
            onCheckedChange={setHideRequests}
            disabled
          />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-ig-text text-base font-semibold">{t("hiddenWordsCustom")}</h3>

        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addWord();
              }
            }}
            placeholder={t("hiddenWordsAddPlaceholder")}
            maxLength={50}
            className="bg-ig-button-secondary text-ig-text placeholder:text-ig-text-secondary h-10 flex-1 rounded-lg px-4 text-sm outline-none"
          />
          <button
            type="button"
            onClick={addWord}
            disabled={update.isPending || !draft.trim()}
            className="bg-ig-primary hover:bg-ig-primary-hover shrink-0 rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            {t("hiddenWordsAdd")}
          </button>
        </div>

        {words.length === 0 ? (
          <p className="text-ig-text-secondary text-sm">{t("hiddenWordsEmpty")}</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {words.map((word) => (
              <li
                key={word}
                className="bg-ig-button-secondary text-ig-text flex items-center gap-1.5 rounded-full py-1.5 pr-2 pl-3 text-sm"
              >
                {word}
                <button
                  type="button"
                  aria-label={t("hiddenWordsRemove", { word })}
                  onClick={() => removeWord(word)}
                  disabled={update.isPending}
                  className="text-ig-text-secondary hover:text-ig-text disabled:opacity-50"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
