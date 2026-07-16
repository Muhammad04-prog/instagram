import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { MusicScreen } from "@/components/music/MusicScreen";

export const metadata: Metadata = { title: "Music" };

export default async function MusicPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <MusicScreen />;
}
