import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  SettingsRow,
  SettingsRowGroup,
  SettingsUnavailableNotice,
} from "@/components/settings/SettingsRow";

export default async function AccountTypePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("settings");

  return (
    <div className="max-w-[640px] space-y-6">
      <h2 className="text-ig-text text-lg font-bold">{t("accountType")}</h2>
      <SettingsUnavailableNotice>{t("acComingSoon")}</SettingsUnavailableNotice>
      <section className="space-y-3">
        <h3 className="text-ig-text text-base font-semibold">{t("accountTypeSection")}</h3>
        <SettingsRowGroup>
          <SettingsRow title={t("switchToProfessional")} />
        </SettingsRowGroup>
      </section>
    </div>
  );
}
