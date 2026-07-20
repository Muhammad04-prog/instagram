import { getTranslations, setRequestLocale } from "next-intl/server";
import { SettingsRow, SettingsRowGroup } from "@/components/settings/SettingsRow";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";

export default async function HelpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("settings");

  return (
    <div className="max-w-[640px] space-y-6">
      <h2 className="text-ig-text text-lg font-bold">{t("help")}</h2>
      <SettingsRowGroup>
        <SettingsRow title={t("helpCenter")} />
        <SettingsRow title={t("fraudCenter")} />
        <Link href={ROUTES.accountStatus}>
          <SettingsRow title={t("accountStatus")} />
        </Link>
        <SettingsRow title={t("privacySecurity")} />
        <SettingsRow title={t("supportRequests")} />
        <SettingsRow title={t("shareExperience")} description={t("shareExperienceHint")} />
      </SettingsRowGroup>
    </div>
  );
}
