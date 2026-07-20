"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { SettingsUnavailableNotice } from "@/components/settings/SettingsRow";
import { SettingsToggleRow } from "@/components/settings/SettingsToggleRow";

/** No like/share-count visibility field on the backend — the toggle stays disabled. */
export function LikeShareCountsSettings() {
  const t = useTranslations("settings");
  const [hideCounts, setHideCounts] = useState(false);

  return (
    <div className="max-w-[640px] space-y-6">
      <h2 className="text-ig-text text-lg font-bold">{t("likeShareCounts")}</h2>
      <SettingsUnavailableNotice>{t("acComingSoon")}</SettingsUnavailableNotice>
      <SettingsToggleRow
        title={t("hideLikeShareCounts")}
        checked={hideCounts}
        onCheckedChange={setHideCounts}
        disabled
      />
      <p className="text-ig-text-secondary text-sm">{t("hideLikeShareCountsHint")}</p>
    </div>
  );
}
