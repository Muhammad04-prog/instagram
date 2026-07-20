import { setRequestLocale } from "next-intl/server";
import { DraftsList } from "@/components/settings/DraftsList";

export default async function DraftsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <DraftsList />;
}
