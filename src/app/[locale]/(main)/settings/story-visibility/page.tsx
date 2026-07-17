import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  SettingsRow,
  SettingsRowGroup,
  SettingsUnavailableNotice,
} from "@/components/settings/SettingsRow";

export default async function StoryVisibilityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("settings");

  return (
    <div className="max-w-[640px] space-y-6">
      <h2 className="text-ig-text text-lg font-bold">{t("storyVisibilityTitle")}</h2>
      <SettingsUnavailableNotice>{t("acComingSoon")}</SettingsUnavailableNotice>
      <SettingsRowGroup>
        <SettingsRow title={t("hideStoryFrom")} />
      </SettingsRowGroup>
    </div>
  );
}
