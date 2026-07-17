"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { SettingsToggleRow } from "@/components/settings/SettingsToggleRow";
import { SettingsUnavailableNotice } from "@/components/settings/SettingsRow";

/** No archive-preference endpoint on the backend — the toggle stays disabled. */
export function ArchivingSettings() {
  const t = useTranslations("settings");
  const [saveToArchive, setSaveToArchive] = useState(true);

  return (
    <div className="max-w-[640px] space-y-6">
      <h2 className="text-ig-text text-lg font-bold">{t("archiving")}</h2>
      <SettingsUnavailableNotice>{t("acComingSoon")}</SettingsUnavailableNotice>
      <section className="space-y-3">
        <h3 className="text-ig-text text-base font-semibold">{t("saveToArchiveSection")}</h3>
        <SettingsToggleRow
          title={t("saveStoryToArchive")}
          checked={saveToArchive}
          onCheckedChange={setSaveToArchive}
          disabled
        />
      </section>
      <p className="text-ig-text-secondary text-sm">{t("saveStoryToArchiveHint")}</p>
    </div>
  );
}
