"use client";

import { useTranslations } from "next-intl";
import { SettingsToggleRow } from "@/components/settings/SettingsToggleRow";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";

/**
 * Settings → Notifications. `pushEnabled` / `emailEnabled` arrived with the
 * 19.07.2026 swagger refresh — this screen used to say outright that no such
 * endpoint existed.
 */
export function NotificationsSettings() {
  const t = useTranslations("settings");
  const { data: settings, isPending, isError, refetch } = useSettings();
  const update = useUpdateSettings();

  if (isPending) return <Loader className="py-10" />;
  if (isError || !settings) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <div className="max-w-[640px] space-y-6">
      <h2 className="text-ig-text text-lg font-bold">{t("notifications")}</h2>
      <div className="space-y-2">
        <SettingsToggleRow
          title={t("pushNotifications")}
          checked={settings.pushEnabled}
          onCheckedChange={(pushEnabled) => update.mutate({ pushEnabled })}
          disabled={update.isPending}
        />
        <SettingsToggleRow
          title={t("emailNotifications")}
          checked={settings.emailEnabled}
          onCheckedChange={(emailEnabled) => update.mutate({ emailEnabled })}
          disabled={update.isPending}
        />
      </div>
    </div>
  );
}
