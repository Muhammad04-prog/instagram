import { setRequestLocale } from "next-intl/server";
import { HiddenWordsSettings } from "@/components/settings/HiddenWordsSettings";

export default async function HiddenWordsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HiddenWordsSettings />;
}
