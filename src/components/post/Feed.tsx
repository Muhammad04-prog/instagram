"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { PostCard } from "@/components/post/PostCard";
import { PostCardSkeleton } from "@/components/post/PostSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { CompassIcon } from "@/components/icons";
import { useFeed } from "@/hooks/usePosts";
import { flattenPages } from "@/lib/cursor";

/** `/` — posts of the people I follow, infinite scroll (docs/screenshots/img10). */
export function Feed() {
  const t = useTranslations("feed");
  const { data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFeed();

  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !isFetchingNextPage) void fetchNextPage();
      },
      { rootMargin: "600px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isPending) {
    return (
      <div className="space-y-6">
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  const posts = flattenPages(data);

  if (posts.length === 0) {
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
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      <div ref={sentinel} className="h-10" />
      {isFetchingNextPage ? <Loader /> : null}
    </div>
  );
}
