import { setRequestLocale } from "next-intl/server";
import { FavoritesScreen } from "@/components/profile/FavoritesScreen";

export default async function FavoritesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <FavoritesScreen />;
}
