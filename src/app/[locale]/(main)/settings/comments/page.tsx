import { setRequestLocale } from "next-intl/server";
import { CommentsSettings } from "@/components/settings/CommentsSettings";

export default async function CommentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CommentsSettings />;
}
