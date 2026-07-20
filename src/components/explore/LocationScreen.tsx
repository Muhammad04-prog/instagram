"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { GridIcon } from "@/components/icons";
import { PostGrid, PostGridSkeleton } from "@/components/profile/PostGrid";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { useLocation } from "@/hooks/useLocation";
import { EXPLORE_PAGE_SIZE } from "@/lib/constants";
import { cursorParams, flattenPages, nextCursor } from "@/lib/cursor";
import { queryKeys } from "@/lib/query-keys";
import { locationService } from "@/services/location.service";

/**
 * One place — now with its post grid: `GET /locations/{id}/posts` closed the
 * gap this screen used to document as missing entirely.
 */
export function LocationScreen({ locationId }: { locationId: number }) {
  const t = useTranslations("explore");
  const { data: location, isPending, isError, refetch } = useLocation(locationId);
  const sentinel = useRef<HTMLDivElement>(null);

  const {
    data: postsData,
    isPending: postsPending,
    isError: postsError,
    refetch: refetchPosts,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: queryKeys.locations.posts(locationId),
    queryFn: ({ pageParam }) =>
      locationService.getLocationPosts(locationId, cursorParams(pageParam, EXPLORE_PAGE_SIZE)),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => nextCursor(lastPage, EXPLORE_PAGE_SIZE),
    enabled: locationId > 0,
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

  if (isPending) return <PostGridSkeleton />;
  if (isError || !location) return <ErrorState onRetry={() => void refetch()} />;

  const posts = flattenPages(postsData);

  return (
    <div className="mx-auto max-w-[975px] px-4 py-6">
      <header className="mb-8 flex items-center gap-6">
        <span className="bg-ig-button-secondary flex size-[100px] shrink-0 items-center justify-center rounded-full">
          <MapPin className="text-ig-text size-10" />
        </span>
        <div className="min-w-0">
          <h1 className="text-ig-text text-xl font-semibold">{location.city}</h1>
          <p className="text-ig-text-secondary text-sm">
            {[location.state, location.country].filter(Boolean).join(", ")}
          </p>
        </div>
      </header>

      {postsPending ? (
        <PostGridSkeleton />
      ) : postsError ? (
        <ErrorState onRetry={() => void refetchPosts()} />
      ) : posts.length === 0 ? (
        <EmptyState icon={<GridIcon className="size-8" />} title={t("locationNoFeed")} />
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
