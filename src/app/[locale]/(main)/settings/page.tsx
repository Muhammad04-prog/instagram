import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LanguageSwitcher } from "@/components/settings/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/settings/ThemeSwitcher";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("settings");

  return (
    <div className="max-w-[640px] space-y-8">
      <section className="space-y-3">
        <h2 className="text-ig-text text-lg font-bold">{t("appearance")}</h2>
        <ThemeSwitcher />
      </section>

      <Separator className="bg-ig-separator" />

      <section className="space-y-3">
        <h2 className="text-ig-text text-lg font-bold">{t("language")}</h2>
        <LanguageSwitcher />
      </section>
    </div>
  );
}
