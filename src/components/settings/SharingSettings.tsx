"use client";

import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { SettingsToggleRow } from "@/components/settings/SettingsToggleRow";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";

/** Settings → Возможность делиться контентом (img11) — `allowStoryReshare`. */
export function SharingSettings() {
  const t = useTranslations("settings");
  const { data: settings, isPending, isError, refetch } = useSettings();
  const update = useUpdateSettings();

  if (isPending) return <Loader className="py-10" />;
  if (isError || !settings) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <div className="max-w-[640px] space-y-6">
      <h2 className="text-ig-text text-lg font-bold">{t("sharing")}</h2>

      <section className="space-y-3">
        <h3 className="text-ig-text text-base font-semibold">{t("sharingWhat")}</h3>
        <SettingsToggleRow
          title={t("storyReposts")}
          checked={settings.allowStoryReshare}
          onCheckedChange={(allowStoryReshare) => update.mutate({ allowStoryReshare })}
          disabled={update.isPending}
        />
      </section>

      <p className="text-ig-text-secondary text-sm">{t("storyRepostsHint")}</p>
    </div>
  );
}
