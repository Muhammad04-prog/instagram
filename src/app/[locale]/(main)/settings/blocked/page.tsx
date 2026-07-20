import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BlockedAccountsList } from "@/components/settings/BlockedAccountsList";

export const metadata: Metadata = { title: "Blocked accounts" };

export default async function BlockedPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("settings");

  return (
    <div className="max-w-[640px] space-y-6">
      <h2 className="text-ig-text text-lg font-bold">{t("blocked")}</h2>
      <p className="text-ig-text-secondary text-sm">{t("blockedHint")}</p>
      <BlockedAccountsList />
    </div>
  );
}
