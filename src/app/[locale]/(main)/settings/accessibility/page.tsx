import { setRequestLocale } from "next-intl/server";
import { AccessibilitySettings } from "@/components/settings/AccessibilitySettings";

export default async function AccessibilityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AccessibilitySettings />;
}
