import { setRequestLocale } from "next-intl/server";

// Grid + infinite scroll land in Phase 7. Present now so the sidebar's
// auto-collapse on /explore is exercisable.
export default async function ExplorePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <main className="mx-auto max-w-[935px] px-4 py-6" />;
}
