"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { BookmarkIcon, GridIcon, TaggedIcon } from "@/components/icons";
import { PostGrid, PostGridSkeleton } from "@/components/profile/PostGrid";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileHeaderSkeleton } from "@/components/profile/ProfileSkeleton";
import { ProfileTabs, type ProfileTab } from "@/components/profile/ProfileTabs";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useFavorites, useMyProfile, useUserProfile } from "@/hooks/useProfile";
import { useMyPosts, useUserPosts, useUserReels, useUserTagged } from "@/hooks/usePosts";
import type { PostDto } from "@/types/post.types";

/**
 * Shared by /profile/me and /profile/[userId].
 *
 * Reels and Tagged are their own endpoints now. Phase 4 had to derive the reels
 * tab by filtering the grid for video files, and left Tagged as a placeholder —
 * softclub had neither.
 */
export function ProfileView({ userId, isMe }: { userId: string; isMe: boolean }) {
  const t = useTranslations("profile");
  const [tab, setTab] = useState<ProfileTab>("posts");

  const mine = useMyProfile();
  const other = useUserProfile(isMe ? "" : userId);
  const profileQuery = isMe ? mine : other;

  const myPosts = useMyPosts(isMe);
  const otherPosts = useUserPosts(userId, !isMe);
  const posts = isMe ? myPosts : otherPosts;

  const reelsQuery = useUserReels(userId, tab === "reels");
  const taggedQuery = useUserTagged(userId, tab === "tagged");
  const favorites = useFavorites();

  const allPosts = useMemo(
    () => (isMe ? myPosts : otherPosts).data?.pages.flat() ?? [],
    [isMe, myPosts, otherPosts],
  );
  const reels = useMemo(() => reelsQuery.data?.pages.flat() ?? [], [reelsQuery.data]);
  const tagged = useMemo(() => taggedQuery.data?.pages.flat() ?? [], [taggedQuery.data]);
  const savedPosts = useMemo(() => favorites.data?.pages.flat() ?? [], [favorites.data]);

  if (profileQuery.isPending) return <ProfileHeaderSkeleton />;

  if (profileQuery.isError || !profileQuery.data) {
    return <ErrorState onRetry={() => void profileQuery.refetch()} />;
  }

  return (
    <div className="pb-16">
      <ProfileHeader userId={userId} profile={profileQuery.data} isMe={isMe} />

      <ProfileTabs value={tab} onChange={setTab} showSaved={isMe} />

      <div className="pt-4">
        {tab === "posts" ? (
          <Panel
            query={posts}
            items={allPosts}
            emptyIcon={<GridIcon className="size-8" />}
            emptyTitle={t("noPosts")}
            emptyDescription={isMe ? t("noPostsDescription") : undefined}
          />
        ) : tab === "reels" ? (
          <Panel
            query={reelsQuery}
            items={reels}
            emptyIcon={<GridIcon className="size-8" />}
            emptyTitle={t("noReels")}
          />
        ) : tab === "saved" ? (
          <Panel
            query={favorites}
            items={savedPosts}
            emptyIcon={<BookmarkIcon className="size-8" />}
            emptyTitle={t("noSaved")}
            emptyDescription={t("savedOnlyVisibleToYou")}
          />
        ) : (
          <Panel
            query={taggedQuery}
            items={tagged}
            emptyIcon={<TaggedIcon className="size-8" />}
            emptyTitle={t("taggedTitle")}
            emptyDescription={t("taggedDescription")}
          />
        )}
      </div>
    </div>
  );
}

/** loading → error → empty → grid, the three states every screen owes (CLAUDE.md). */
function Panel({
  query,
  items,
  emptyIcon,
  emptyTitle,
  emptyDescription,
}: {
  query: { isPending: boolean; isError: boolean; refetch: () => unknown };
  items: PostDto[];
  emptyIcon: React.ReactNode;
  emptyTitle: string;
  emptyDescription?: string;
}) {
  if (query.isPending) return <PostGridSkeleton />;
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;
  if (items.length === 0) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />;
  }
  return <PostGrid posts={items} />;
}
