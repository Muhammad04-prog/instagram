import { setRequestLocale } from "next-intl/server";
import { LanguagePreferences } from "@/components/settings/LanguagePreferences";

export default async function LanguagePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LanguagePreferences />;
}
