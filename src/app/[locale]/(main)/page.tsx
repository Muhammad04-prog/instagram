import { setRequestLocale } from "next-intl/server";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { Feed } from "@/components/post/Feed";
import { StoryAvatarList } from "@/components/story/StoryAvatarList";

// 935px is IG's desktop content width: 470px feed column + right column.
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto flex max-w-[935px] justify-center px-4 md:px-8">
      <main className="max-w-feed w-full py-6">
        <StoryAvatarList />
        <Feed />
      </main>
      <RightSidebar />
    </div>
  );
}
