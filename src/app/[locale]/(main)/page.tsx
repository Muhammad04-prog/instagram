import { setRequestLocale } from "next-intl/server";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { Feed } from "@/components/post/Feed";

// 935px is IG's desktop content width: 470px feed column + right column.
// The stories rail on top of the feed arrives with Phase 6.
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto flex max-w-[935px] justify-center px-4 md:px-8">
      <main className="max-w-feed w-full py-6">
        <Feed />
      </main>
      <RightSidebar />
    </div>
  );
}
