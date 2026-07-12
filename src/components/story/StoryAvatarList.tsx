"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { StoryRing } from "@/components/story/StoryRing";
import { StoryUploadDialog } from "@/components/story/StoryUploadDialog";
import { ErrorState } from "@/components/shared/ErrorState";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useMyProfile } from "@/hooks/useProfile";
import { useStories } from "@/hooks/useStories";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { useStoryStore } from "@/store/story.store";

/**
 * The rail above the feed (docs/screenshots/img10). get-stories returns every
 * author — including me and authors with an empty `stories[]` — so the empty
 * ones are filtered out and "Your story" is pinned first with a + badge.
 */
export function StoryAvatarList() {
  const t = useTranslations("story");
  const router = useRouter();
  const { user } = useAuth();
  const { data: profile } = useMyProfile();
  const { data, isPending, isError, refetch } = useStories();
  const seen = useStoryStore((state) => state.seen);
  const [uploadOpen, setUploadOpen] = useState(false);

  if (isPending) {
    return (
      <div className="border-ig-separator mb-6 flex gap-4 border-b pb-4">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex flex-col items-center gap-1">
            <Skeleton className="size-16 rounded-full" />
            <Skeleton className="h-2 w-12" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={() => void refetch()} className="py-6" />;

  const mine = data.find((group) => group.userId === user?.userId);
  const others = data.filter((group) => group.userId !== user?.userId && group.stories.length > 0);

  const isGroupSeen = (storyIds: number[]) => storyIds.every((id) => seen.includes(id));

  return (
    <>
      <div className="border-ig-separator mb-6 flex scrollbar-none gap-4 overflow-x-auto border-b pb-4">
        <button
          type="button"
          onClick={() =>
            mine && mine.stories.length > 0
              ? router.push(ROUTES.stories(user?.userId ?? ""))
              : setUploadOpen(true)
          }
          className="flex w-16 shrink-0 flex-col items-center gap-1"
        >
          <span className="relative">
            {mine && mine.stories.length > 0 ? (
              <StoryRing
                src={profile?.image ?? null}
                alt={profile?.userName ?? ""}
                seen={isGroupSeen(mine.stories.map((story) => story.id))}
              />
            ) : (
              <>
                <UserAvatar src={profile?.image} size={56} className="m-[6px]" />
                <span className="bg-ig-primary absolute right-1 bottom-1 flex size-5 items-center justify-center rounded-full border-2 border-[color:var(--ig-bg)]">
                  <Plus className="size-3 text-white" />
                </span>
              </>
            )}
          </span>
          <span className="text-ig-text w-full truncate text-center text-xs">{t("yourStory")}</span>
        </button>

        {others.map((group) => (
          <button
            key={group.userId}
            type="button"
            onClick={() => router.push(ROUTES.stories(group.userId))}
            className="flex w-16 shrink-0 flex-col items-center gap-1"
          >
            <StoryRing
              src={group.userImage}
              alt={group.userName}
              seen={isGroupSeen(group.stories.map((story) => story.id))}
            />
            <span className="text-ig-text w-full truncate text-center text-xs">
              {group.userName}
            </span>
          </button>
        ))}
      </div>

      <StoryUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </>
  );
}
