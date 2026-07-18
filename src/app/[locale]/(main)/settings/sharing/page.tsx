import { setRequestLocale } from "next-intl/server";
import { SharingSettings } from "@/components/settings/SharingSettings";

export default async function SharingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <SharingSettings />;
}
