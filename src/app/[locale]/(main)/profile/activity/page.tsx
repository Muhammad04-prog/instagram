import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ActivityScreen } from "@/components/profile/ActivityScreen";

export const metadata: Metadata = { title: "Your activity" };

export default async function ActivityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("profile");

  return (
    <div className="mx-auto max-w-[640px] px-4 py-6">
      <h1 className="text-ig-text mb-6 text-xl font-bold">{t("activityTitle")}</h1>
      <ActivityScreen />
    </div>
  );
}
