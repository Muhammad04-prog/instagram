"use client";

import { useTranslations } from "next-intl";
import { SettingsRadioGroup } from "@/components/settings/SettingsRadioGroup";
import { SettingsRow, SettingsRowGroup } from "@/components/settings/SettingsRow";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import type { SettingsDto } from "@/types/api.types";

type AudiencePolicy = SettingsDto["whoCanTag"];

/**
 * Settings → Метки и упоминания (img9). `whoCanTag` / `whoCanMention` came in
 * with the 19.07.2026 swagger refresh — this screen used to be pure local
 * `useState` with every control disabled. "Manually approve tags" has no
 * backend field, so that row stays inert.
 */
export function TagsMentionsSettings() {
  const t = useTranslations("settings");
  const { data: settings, isPending, isError, refetch } = useSettings();
  const update = useUpdateSettings();

  if (isPending) return <Loader className="py-10" />;
  if (isError || !settings) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <div className="max-w-[640px] space-y-10">
      <h2 className="text-ig-text text-lg font-bold">{t("tags")}</h2>

      <section className="space-y-3">
        <h3 className="text-ig-text text-base font-semibold">{t("tagsWhoCanTag")}</h3>
        <p className="text-ig-text-secondary text-sm">{t("tagsWhoCanTagHint")}</p>
        <SettingsRadioGroup
          name="tag-policy"
          value={settings.whoCanTag}
          disabled={update.isPending}
          onChange={(value) => update.mutate({ whoCanTag: value as AudiencePolicy })}
          options={[
            { value: "EVERYONE", label: t("tagAny") },
            { value: "FOLLOWING", label: t("tagFollowing") },
            { value: "NOBODY", label: t("tagNone") },
          ]}
        />
        <SettingsRowGroup className="pt-2">
          <SettingsRow title={t("tagsReview")} href="/settings/tag-review" />
        </SettingsRowGroup>
      </section>

      <section className="space-y-3">
        <h3 className="text-ig-text text-base font-semibold">{t("tagsWhoCanMention")}</h3>
        <p className="text-ig-text-secondary text-sm">{t("tagsWhoCanMentionHint")}</p>
        <SettingsRadioGroup
          name="mention-policy"
          value={settings.whoCanMention}
          disabled={update.isPending}
          onChange={(value) => update.mutate({ whoCanMention: value as AudiencePolicy })}
          options={[
            { value: "EVERYONE", label: t("mentionAny") },
            { value: "FOLLOWING", label: t("mentionFollowing") },
            { value: "NOBODY", label: t("mentionNone") },
          ]}
        />
      </section>
    </div>
  );
}
