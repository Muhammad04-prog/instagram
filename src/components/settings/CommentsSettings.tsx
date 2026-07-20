"use client";

import { useTranslations } from "next-intl";
import { SettingsRadioGroup } from "@/components/settings/SettingsRadioGroup";
import { SettingsToggleRow } from "@/components/settings/SettingsToggleRow";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import type { SettingsDto } from "@/types/api.types";

/** Settings → Комментарии (img10) — `whoCanComment` / `allowGifComments`. */
export function CommentsSettings() {
  const t = useTranslations("settings");
  const { data: settings, isPending, isError, refetch } = useSettings();
  const update = useUpdateSettings();

  if (isPending) return <Loader className="py-10" />;
  if (isError || !settings) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <div className="max-w-[640px] space-y-8">
      <h2 className="text-ig-text text-lg font-bold">{t("comments")}</h2>

      <section className="space-y-3">
        <h3 className="text-ig-text text-base font-semibold">{t("commentsWhoCanComment")}</h3>
        <SettingsRadioGroup
          name="comments-audience"
          value={settings.whoCanComment}
          disabled={update.isPending}
          onChange={(value) =>
            update.mutate({ whoCanComment: value as SettingsDto["whoCanComment"] })
          }
          options={[
            { value: "EVERYONE", label: t("commentsEveryone") },
            { value: "FOLLOWERS", label: t("commentsFollowers") },
            { value: "MUTUAL", label: t("commentsMutual") },
            { value: "OFF", label: t("commentsOff") },
          ]}
        />
      </section>

      <SettingsToggleRow
        title={t("commentsGif")}
        description={t("commentsGifHint")}
        checked={settings.allowGifComments}
        onCheckedChange={(allowGifComments) => update.mutate({ allowGifComments })}
        disabled={update.isPending}
      />
    </div>
  );
}
