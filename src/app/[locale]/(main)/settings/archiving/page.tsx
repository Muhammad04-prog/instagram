import { setRequestLocale } from "next-intl/server";
import { ArchivingSettings } from "@/components/settings/ArchivingSettings";

export default async function ArchivingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ArchivingSettings />;
}
