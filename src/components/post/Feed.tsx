"use client";

import { useTranslations } from "next-intl";
import { PostCard } from "@/components/post/PostCard";
import { PostCardSkeleton } from "@/components/post/PostSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { CompassIcon } from "@/components/icons";
import { useFeed } from "@/hooks/usePosts";

/** `/` — posts of the people I follow, newest first (docs/screenshots/img10). */
export function Feed() {
  const t = useTranslations("feed");
  const { data, isPending, isError, refetch } = useFeed();

  if (isPending) {
    return (
      <div className="space-y-6">
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  if (data.length === 0) {
    return (
      <EmptyState
        icon={<CompassIcon className="size-8" />}
        title={t("empty")}
        description={t("emptyDescription")}
      />
    );
  }

  return (
    <div className="space-y-6">
      {data.map((post) => (
        <PostCard key={post.postId} post={post} />
      ))}
    </div>
  );
}
