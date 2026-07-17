import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  SettingsRow,
  SettingsRowGroup,
  SettingsUnavailableNotice,
} from "@/components/settings/SettingsRow";

// No notification-preferences endpoint exists on the backend (only
// unread-count/read/read-all/profile-views) — confirmed against api.gen.ts.
export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("settings");

  return (
    <div className="max-w-[640px] space-y-6">
      <h2 className="text-ig-text text-lg font-bold">{t("notifications")}</h2>
      <SettingsUnavailableNotice>{t("acComingSoon")}</SettingsUnavailableNotice>
      <SettingsRowGroup>
        <SettingsRow title={t("pushNotifications")} />
        <SettingsRow title={t("emailNotifications")} />
      </SettingsRowGroup>
    </div>
  );
}
