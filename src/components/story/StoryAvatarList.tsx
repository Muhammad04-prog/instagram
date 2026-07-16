"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ErrorState } from "@/components/shared/ErrorState";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { StoryRing } from "@/components/story/StoryRing";
import { StoryUploadDialog } from "@/components/story/StoryUploadDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useMyProfile } from "@/hooks/useProfile";
import { useMyStories, useStories } from "@/hooks/useStories";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";

/**
 * The rail above the feed (docs/screenshots/img10).
 *
 * `StoryRailItemDto` arrives grouped per author and carries `allViewed`, so the
 * grey ring is server truth. Phase 6 had to keep seen-state in localStorage
 * because softclub could not answer "have I seen this?", which left the ring
 * wrong in every other browser. That store is gone.
 */
export function StoryAvatarList() {
  const t = useTranslations("story");
  const router = useRouter();
  const { user } = useAuth();
  const { data: profile } = useMyProfile();
  const { data, isPending, isError, refetch } = useStories();
  const { data: myStories } = useMyStories();
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

  // The rail is other people; my own bubble is pinned first and driven by
  // `/stories/my`, so "Your story" is right regardless of what the rail says.
  const others = data.filter((item) => item.author.id !== user?.id);
  const hasMine = (myStories?.length ?? 0) > 0;
  const myAllViewed = data.find((item) => item.author.id === user?.id)?.allViewed ?? false;

  return (
    <>
      <div className="border-ig-separator mb-6 flex scrollbar-none gap-4 overflow-x-auto border-b pb-4">
        <button
          type="button"
          onClick={() =>
            hasMine ? router.push(ROUTES.stories(user?.id ?? "")) : setUploadOpen(true)
          }
          className="flex w-16 shrink-0 flex-col items-center gap-1"
        >
          <span className="relative">
            {hasMine ? (
              <StoryRing
                src={profile?.avatarUrl ?? null}
                alt={profile?.userName ?? ""}
                seen={myAllViewed}
              />
            ) : (
              <>
                <UserAvatar src={profile?.avatarUrl} size={56} className="m-[6px]" />
                <span className="bg-ig-primary absolute right-1 bottom-1 flex size-5 items-center justify-center rounded-full border-2 border-[color:var(--ig-bg)]">
                  <Plus className="size-3 text-white" />
                </span>
              </>
            )}
          </span>
          <span className="text-ig-text w-full truncate text-center text-xs">{t("yourStory")}</span>
        </button>

        {others.map((item) => (
          <button
            key={item.author.id}
            type="button"
            onClick={() => router.push(ROUTES.stories(item.author.id))}
            className="flex w-16 shrink-0 flex-col items-center gap-1"
          >
            <StoryRing
              src={item.author.avatarUrl ?? null}
              alt={item.author.userName}
              seen={item.allViewed}
              closeFriends={item.hasCloseFriends}
            />
            <span className="text-ig-text w-full truncate text-center text-xs">
              {item.author.userName}
            </span>
          </button>
        ))}
      </div>

      <StoryUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </>
  );
}
