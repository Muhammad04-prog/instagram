"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { SettingsRadioGroup } from "@/components/settings/SettingsRadioGroup";
import { SettingsUnavailableNotice } from "@/components/settings/SettingsRow";
import { SettingsToggleRow } from "@/components/settings/SettingsToggleRow";

/** Settings → Комментарии (img10). Local UI state only — the backend has no
 * per-account comment-audience or GIF preference, so every control is disabled. */
export function CommentsSettings() {
  const t = useTranslations("settings");
  const [audience, setAudience] = useState("followers");
  const [allowGif, setAllowGif] = useState(true);

  return (
    <div className="max-w-[640px] space-y-8">
      <h2 className="text-ig-text text-lg font-bold">{t("comments")}</h2>
      <SettingsUnavailableNotice>{t("acComingSoon")}</SettingsUnavailableNotice>

      <section className="space-y-3">
        <h3 className="text-ig-text text-base font-semibold">{t("commentsWhoCanComment")}</h3>
        <SettingsRadioGroup
          name="comments-audience"
          value={audience}
          onChange={setAudience}
          disabled
          options={[
            { value: "followers", label: t("commentsFollowers") },
            { value: "mutual", label: t("commentsMutual") },
            { value: "off", label: t("commentsOff") },
          ]}
        />
      </section>

      <SettingsToggleRow
        title={t("commentsGif")}
        description={t("commentsGifHint")}
        checked={allowGif}
        onCheckedChange={setAllowGif}
        disabled
      />
    </div>
  );
}
