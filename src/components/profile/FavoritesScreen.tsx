"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { BookmarkIcon } from "@/components/icons";
import { PostGrid, PostGridSkeleton } from "@/components/profile/PostGrid";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { useFavorites } from "@/hooks/useProfile";
import { flattenPages } from "@/lib/cursor";

/** docs/screenshots/img36 — saved posts, infinite scroll, private to the owner. */
export function FavoritesScreen() {
  const t = useTranslations("profile");
  const { data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFavorites();

  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !isFetchingNextPage) void fetchNextPage();
      },
      { rootMargin: "400px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const posts = flattenPages(data);

  return (
    <div className="py-8">
      <h1 className="text-ig-text mb-1 text-xl font-bold">{t("saved")}</h1>
      <p className="text-ig-text-secondary mb-6 text-sm">{t("savedOnlyVisibleToYou")}</p>

      {isPending ? (
        <PostGridSkeleton />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<BookmarkIcon className="size-8" />}
          title={t("noSaved")}
          description={t("noSavedDescription")}
        />
      ) : (
        <>
          <PostGrid posts={posts} />
          <div ref={sentinel} className="h-10" />
          {isFetchingNextPage ? <Loader /> : null}
        </>
      )}
    </div>
  );
}
