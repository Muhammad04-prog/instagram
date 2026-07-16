import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PrivacySettings } from "@/components/settings/PrivacySettings";

export const metadata: Metadata = { title: "Privacy" };

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("settings");

  // Just the page title — each section below carries its own heading and hint,
  // so repeating them here would say everything twice.
  return (
    <div className="max-w-[640px] space-y-6">
      <h2 className="text-ig-text text-lg font-bold">{t("privacy")}</h2>
      <PrivacySettings />
    </div>
  );
}
