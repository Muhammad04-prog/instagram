import { setRequestLocale } from "next-intl/server";
import { TagsMentionsSettings } from "@/components/settings/TagsMentionsSettings";

export default async function TagsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <TagsMentionsSettings />;
}
