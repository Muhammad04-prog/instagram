import { setRequestLocale } from "next-intl/server";
import { SuggestionsScreen } from "@/components/explore/SuggestionsScreen";

/** «Все» — the full suggestions list behind the feed sidebar's link (img4). */
export default async function SuggestionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="mx-auto max-w-[975px]">
      <SuggestionsScreen />
    </main>
  );
}
