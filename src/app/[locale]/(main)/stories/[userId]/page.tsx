import { setRequestLocale } from "next-intl/server";
import { StoryScreen } from "@/components/story/StoryScreen";

export default async function StoriesPage({
  params,
}: {
  params: Promise<{ locale: string; userId: string }>;
}) {
  const { locale, userId } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-6">
      <StoryScreen userId={userId} />
    </div>
  );
}
