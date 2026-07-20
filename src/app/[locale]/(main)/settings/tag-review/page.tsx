import { setRequestLocale } from "next-intl/server";
import { TagReviewList } from "@/components/settings/TagReviewList";

export default async function TagReviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <TagReviewList />;
}
