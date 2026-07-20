import { setRequestLocale } from "next-intl/server";
import { TwoFactorSettings } from "@/components/settings/TwoFactorSettings";

export default async function TwoFactorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <TwoFactorSettings />;
}
