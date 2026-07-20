"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { BookmarkIcon, GridIcon, RepostIcon, TaggedIcon } from "@/components/icons";
import { PostGrid, PostGridSkeleton } from "@/components/profile/PostGrid";
import { HighlightCircles } from "@/components/profile/HighlightCircles";
import { PendingCollabsBanner } from "@/components/profile/PendingCollabsBanner";
import { PrivateAccountGate } from "@/components/profile/PrivateAccountGate";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileHeaderSkeleton } from "@/components/profile/ProfileSkeleton";
import { ProfileTabs, type ProfileTab } from "@/components/profile/ProfileTabs";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import {
  useFavorites,
  useMyProfile,
  useMyReposts,
  useUserProfile,
  useUserReposts,
} from "@/hooks/useProfile";
import { useMyPosts, useUserPosts, useUserReels, useUserTagged } from "@/hooks/usePosts";
import type { PostDto } from "@/types/post.types";
import { flattenPages } from "@/lib/cursor";

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
  // Two endpoints, one tab: /profile/me/reposts for myself (it is the only one
  // that answers for the signed-in user) and /profile/{id}/reposts for everyone
  // else. Exactly one of them is ever enabled.
  const myRepostsQuery = useMyReposts(isMe && tab === "reposts");
  const otherRepostsQuery = useUserReposts(userId, !isMe && tab === "reposts");
  const repostsQuery = isMe ? myRepostsQuery : otherRepostsQuery;

  const allPosts = useMemo(() => {
    const flat = flattenPages((isMe ? myPosts : otherPosts).data);
    // Pinned first (max 3, server-enforced) — a stable sort keeps everything
    // else in its arrival order.
    return [...flat].sort((a, b) => (b.pinnedAt ? 1 : 0) - (a.pinnedAt ? 1 : 0));
  }, [isMe, myPosts, otherPosts]);
  const reels = useMemo(() => flattenPages(reelsQuery.data), [reelsQuery.data]);
  const reposts = useMemo(() => flattenPages(repostsQuery.data), [repostsQuery.data]);
  const tagged = useMemo(() => flattenPages(taggedQuery.data), [taggedQuery.data]);
  const savedPosts = useMemo(() => flattenPages(favorites.data), [favorites.data]);

  if (profileQuery.isPending) return <ProfileHeaderSkeleton />;

  if (profileQuery.isError || !profileQuery.data) {
    return <ErrorState onRetry={() => void profileQuery.refetch()} />;
  }

  const profile = profileQuery.data;

  // A private account I have not been accepted by: posts/reels/tagged all answer
  // 403. That is the product, not a failure — show the lock instead of the tabs.
  const locked = "canViewContent" in profile && !profile.canViewContent;

  return (
    <div className="pb-16">
      <ProfileHeader userId={userId} profile={profile} isMe={isMe} />

      {/* A locked account hides its highlights too — they are stories. */}
      {locked ? null : <HighlightCircles userId={userId} isMe={isMe} />}

      {locked ? <PrivateAccountGate /> : null}

      {locked ? null : <ProfileTabs value={tab} onChange={setTab} showSaved={isMe} />}

      <div className={locked ? "hidden" : "pt-4"}>
        {tab === "posts" && isMe ? <PendingCollabsBanner /> : null}

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
        ) : tab === "reposts" ? (
          <Panel
            query={repostsQuery}
            items={reposts}
            emptyIcon={<RepostIcon className="size-8" />}
            emptyTitle={t("noReposts")}
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
