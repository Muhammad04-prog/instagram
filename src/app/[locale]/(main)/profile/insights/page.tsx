import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProfileInsightsScreen } from "@/components/profile/ProfileInsightsScreen";

export const metadata: Metadata = { title: "Insights" };

export default async function ProfileInsightsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("profile");

  return (
    <div className="mx-auto max-w-[640px] px-4 py-6">
      <h1 className="text-ig-text mb-6 text-xl font-bold">{t("insightsTitle")}</h1>
      <ProfileInsightsScreen />
    </div>
  );
}
