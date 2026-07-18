import { setRequestLocale } from "next-intl/server";
import { LikeShareCountsSettings } from "@/components/settings/LikeShareCountsSettings";

export default async function LikeShareCountsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LikeShareCountsSettings />;
}
