import { setRequestLocale } from "next-intl/server";
import { StoryModal } from "@/components/story/StoryModal";

/** Intercepting route: a story opened from the rail plays over the feed. */
export default async function InterceptedStoriesPage({
  params,
}: {
  params: Promise<{ locale: string; userId: string }>;
}) {
  const { locale, userId } = await params;
  setRequestLocale(locale);

  return <StoryModal userId={userId} />;
}
