import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { GoLiveScreen } from "@/components/live/GoLiveScreen";

export const metadata: Metadata = { title: "Go live" };

export default async function GoLivePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <GoLiveScreen />;
}
