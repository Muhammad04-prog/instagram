import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  SettingsRow,
  SettingsRowGroup,
  SettingsUnavailableNotice,
} from "@/components/settings/SettingsRow";

export default async function MessagesSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("settings");

  return (
    <div className="max-w-[640px] space-y-8">
      <h2 className="text-ig-text text-lg font-bold">{t("messagesSettings")}</h2>
      <SettingsUnavailableNotice>{t("acComingSoon")}</SettingsUnavailableNotice>

      <section className="space-y-3">
        <h3 className="text-ig-text text-base font-semibold">{t("howPeopleContact")}</h3>
        <SettingsRowGroup>
          <SettingsRow title={t("messageSettingsRow")} />
          <SettingsRow title={t("storyRepliesRow")} />
        </SettingsRowGroup>
      </section>

      <section className="space-y-3">
        <h3 className="text-ig-text text-base font-semibold">{t("whoSeesOnline")}</h3>
        <SettingsRowGroup>
          <SettingsRow title={t("onlineStatusRow")} />
        </SettingsRowGroup>
      </section>
    </div>
  );
}
