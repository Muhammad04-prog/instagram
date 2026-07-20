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

  // `FeedDto` pages are always the envelope shape (never a bare array), so
  // this reads `.items` directly rather than through the shape-aware
  // `flattenPages` — its `Page<T>` type requires `nextCursor`, which here is
  // merely optional, and the mismatch is the only thing standing in the way.
  const posts = data?.pages.flatMap((page) => page.items) ?? [];
  // `allCaughtUp`/`suggested` ride on the last loaded page, not the flattened
  // list — `FeedDto` carries them alongside `items`, one value per page
  // rather than per post.
  const lastPage = data?.pages.at(-1);
  // Only worth showing once there is nothing left to page through — earlier
  // pages may already say `true` before the whole list has actually loaded.
  const showCaughtUp = lastPage?.allCaughtUp && !hasNextPage;
  const suggested = !hasNextPage ? (lastPage?.suggested ?? []) : [];

  if (posts.length === 0 && suggested.length === 0) {
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

      {showCaughtUp ? (
        <div className="flex flex-col items-center gap-1 py-8 text-center">
          <p className="text-ig-text text-base font-semibold">{t("allCaughtUp")}</p>
          <p className="text-ig-text-secondary text-sm">{t("allCaughtUpDescription")}</p>
        </div>
      ) : null}

      {suggested.length > 0 ? (
        <>
          <p className="text-ig-text-secondary text-center text-sm font-semibold">
            {t("suggestedForYou")}
          </p>
          {suggested.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </>
      ) : null}
    </div>
  );
}
