import { setRequestLocale } from "next-intl/server";
import { ReelsFeed } from "@/components/reel/ReelsFeed";

export default async function ReelsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ReelsFeed />;
}
