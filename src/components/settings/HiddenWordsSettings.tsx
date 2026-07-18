"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  SettingsRow,
  SettingsRowGroup,
  SettingsUnavailableNotice,
} from "@/components/settings/SettingsRow";
import { SettingsToggleRow } from "@/components/settings/SettingsToggleRow";

/** Settings → Скрытые слова (img19). Local UI state — no moderation-preference
 * endpoints on the backend, so every control here is disabled. */
export function HiddenWordsSettings() {
  const t = useTranslations("settings");
  const [hideComments, setHideComments] = useState(true);
  const [advancedFilter, setAdvancedFilter] = useState(true);
  const [hideRequests, setHideRequests] = useState(true);
  const [hideCommentsWords, setHideCommentsWords] = useState(false);
  const [hideRequestsWords, setHideRequestsWords] = useState(false);

  return (
    <div className="max-w-[640px] space-y-10">
      <h2 className="text-ig-text text-lg font-bold">{t("hiddenWords")}</h2>
      <SettingsUnavailableNotice>{t("acComingSoon")}</SettingsUnavailableNotice>

      <section className="space-y-3">
        <h3 className="text-ig-text text-base font-semibold">{t("hiddenWordsUnwanted")}</h3>
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
        <SettingsRowGroup>
          <SettingsRow title={t("hiddenWordsManage")} />
        </SettingsRowGroup>
        <div className="space-y-4 pt-2">
          <SettingsToggleRow
            title={t("hideComments")}
            description={t("hiddenWordsCommentsCustomHint")}
            checked={hideCommentsWords}
            onCheckedChange={setHideCommentsWords}
            disabled
          />
          <SettingsToggleRow
            title={t("hideRequests")}
            description={t("hiddenWordsRequestsCustomHint")}
            checked={hideRequestsWords}
            onCheckedChange={setHideRequestsWords}
            disabled
          />
        </div>
      </section>
    </div>
  );
}
