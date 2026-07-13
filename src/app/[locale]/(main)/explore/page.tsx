import { setRequestLocale } from "next-intl/server";
import { ExploreGrid } from "@/components/explore/ExploreGrid";

export default async function ExplorePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="mx-auto max-w-[975px] px-4 py-6">
      <ExploreGrid />
    </main>
  );
}
