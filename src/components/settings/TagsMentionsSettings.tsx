"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { SettingsRadioGroup } from "@/components/settings/SettingsRadioGroup";
import {
  SettingsRow,
  SettingsRowGroup,
  SettingsUnavailableNotice,
} from "@/components/settings/SettingsRow";

/** Settings → Метки и упоминания (img9). Fully local UI state — no such
 * preference exists on the backend, so every control here is disabled. */
export function TagsMentionsSettings() {
  const t = useTranslations("settings");
  const [tagPolicy, setTagPolicy] = useState("everyone");
  const [mentionPolicy, setMentionPolicy] = useState("everyone");

  return (
    <div className="max-w-[640px] space-y-10">
      <h2 className="text-ig-text text-lg font-bold">{t("tags")}</h2>
      <SettingsUnavailableNotice>{t("acComingSoon")}</SettingsUnavailableNotice>

      <section className="space-y-3">
        <h3 className="text-ig-text text-base font-semibold">{t("tagsWhoCanTag")}</h3>
        <p className="text-ig-text-secondary text-sm">{t("tagsWhoCanTagHint")}</p>
        <SettingsRadioGroup
          name="tag-policy"
          value={tagPolicy}
          onChange={setTagPolicy}
          disabled
          options={[
            { value: "everyone", label: t("tagAny") },
            { value: "following", label: t("tagFollowing") },
            { value: "none", label: t("tagNone") },
          ]}
        />
        <SettingsRowGroup className="pt-2">
          <SettingsRow title={t("tagsApproveManually")} />
        </SettingsRowGroup>
      </section>

      <section className="space-y-3">
        <h3 className="text-ig-text text-base font-semibold">{t("tagsWhoCanMention")}</h3>
        <p className="text-ig-text-secondary text-sm">{t("tagsWhoCanMentionHint")}</p>
        <SettingsRadioGroup
          name="mention-policy"
          value={mentionPolicy}
          onChange={setMentionPolicy}
          disabled
          options={[
            { value: "everyone", label: t("mentionAny") },
            { value: "following", label: t("mentionFollowing") },
            { value: "none", label: t("mentionNone") },
          ]}
        />
      </section>
    </div>
  );
}
