"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { GridIcon } from "@/components/icons";
import { PostGrid, PostGridSkeleton } from "@/components/profile/PostGrid";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { EXPLORE_PAGE_SIZE } from "@/lib/constants";
import { cursorParams, nextCursor } from "@/lib/cursor";
import { queryKeys } from "@/lib/query-keys";
import { searchService } from "@/services/search.service";

/**
 * All posts under one hashtag — the target of a #tag in a caption.
 *
 * Hashtags are new: softclub never parsed them, so a caption was just text.
 */
export function HashtagScreen({ name }: { name: string }) {
  const t = useTranslations("explore");
  const sentinel = useRef<HTMLDivElement>(null);

  const { data, isPending, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: queryKeys.search.hashtag(name),
      queryFn: ({ pageParam }) =>
        searchService.getHashtag(name, cursorParams(pageParam, EXPLORE_PAGE_SIZE)),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => nextCursor(lastPage, EXPLORE_PAGE_SIZE),
    });

  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasNextPage) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && !isFetchingNextPage) void fetchNextPage();
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flat() ?? [];

  return (
    <div className="mx-auto max-w-[975px] px-4 py-6">
      <header className="mb-8 flex items-center gap-6">
        <span className="bg-ig-button-secondary flex size-[100px] shrink-0 items-center justify-center rounded-full">
          <span className="text-ig-text text-4xl">#</span>
        </span>
        <div>
          <h1 className="text-ig-text text-xl font-semibold">#{name}</h1>
          {/* The endpoint answers posts, not a count — so no number is invented. */}
          <p className="text-ig-text-secondary text-sm">{t("hashtagSubtitle")}</p>
        </div>
      </header>

      {isPending ? (
        <PostGridSkeleton />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : posts.length === 0 ? (
        <EmptyState icon={<GridIcon className="size-8" />} title={t("hashtagEmpty", { name })} />
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
