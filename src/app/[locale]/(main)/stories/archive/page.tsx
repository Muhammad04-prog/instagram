import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { StoryArchiveScreen } from "@/components/story/StoryArchiveScreen";

export const metadata: Metadata = { title: "Archive" };

/** docs/screenshots/img45 — «Архивировать» → таб «Истории». */
export default async function StoryArchivePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <StoryArchiveScreen />;
}
