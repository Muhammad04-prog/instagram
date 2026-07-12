"use client";

import { StoryViewer } from "@/components/story/StoryViewer";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";

/** Full-page fallback for /stories/[userId] (deep link, hard reload). */
export function StoryScreen({ userId }: { userId: string }) {
  const router = useRouter();

  return <StoryViewer userId={userId} onClose={() => router.push(ROUTES.home)} />;
}
