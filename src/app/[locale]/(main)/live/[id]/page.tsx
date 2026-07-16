import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LiveScreen } from "@/components/live/LiveScreen";

export const metadata: Metadata = { title: "Live" };

export default async function LivePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <LiveScreen liveId={id} />;
}
