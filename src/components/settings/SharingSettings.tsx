"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { SettingsUnavailableNotice } from "@/components/settings/SettingsRow";
import { SettingsToggleRow } from "@/components/settings/SettingsToggleRow";

/** Settings → Возможность делиться контентом (img11). Local UI state — no
 * backend field for "allow story reposts", so the toggle stays disabled. */
export function SharingSettings() {
  const t = useTranslations("settings");
  const [reposts, setReposts] = useState(false);

  return (
    <div className="max-w-[640px] space-y-6">
      <h2 className="text-ig-text text-lg font-bold">{t("sharing")}</h2>
      <SettingsUnavailableNotice>{t("acComingSoon")}</SettingsUnavailableNotice>

      <section className="space-y-3">
        <h3 className="text-ig-text text-base font-semibold">{t("sharingWhat")}</h3>
        <SettingsToggleRow
          title={t("storyReposts")}
          checked={reposts}
          onCheckedChange={setReposts}
          disabled
        />
      </section>

      <p className="text-ig-text-secondary text-sm">{t("storyRepostsHint")}</p>
    </div>
  );
}
