"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { CarouselIcon, ClipIcon, CommentIcon, HeartIcon } from "@/components/icons";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { Skeleton } from "@/components/ui/skeleton";
import { useExplorePosts } from "@/hooks/usePosts";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { filterCss } from "@/lib/filters";
import { formatCount, getImageUrl } from "@/lib/utils";
import { coverMedia, isCarousel, isVideo, mediaPoster, type PostDto } from "@/types/post.types";

/**
 * /explore — 4 columns of portrait (3:4) tiles with 4px gutters, exactly as in
 * docs/screenshots/img23–img24. Note this is NOT the old 3-column mosaic with a
 * 2×2 hero tile: current IG dropped it, and the reference shots show a uniform
 * grid. Clicking a tile opens the intercepted post modal from Phase 5.
 */
export function ExploreGrid() {
  const t = useTranslations("explore");
  const tPost = useTranslations("post");
  const { data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useExplorePosts();

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
      <div className="grid grid-cols-2 gap-1 md:grid-cols-4">
        {Array.from({ length: 12 }, (_, index) => (
          <Skeleton key={index} className="aspect-[3/4] rounded-none" />
        ))}
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  const posts = data.pages.flat();

  if (posts.length === 0) return <EmptyState title={t("empty")} />;

  return (
    <>
      <ul className="grid grid-cols-2 gap-1 md:grid-cols-4">
        {posts.map((post) => (
          <Tile key={post.id} post={post} likeLabel={tPost("like")} />
        ))}
      </ul>
      <div ref={sentinel} className="h-10" />
      {isFetchingNextPage ? <Loader /> : null}
    </>
  );
}

function Tile({ post, likeLabel }: { post: PostDto; likeLabel: string }) {
  const cover = coverMedia(post);
  const url = cover ? getImageUrl(mediaPoster(cover)) : null;
  const video = Boolean(cover && isVideo(cover));

  return (
    <li className="relative aspect-[3/4]">
      <Link
        href={ROUTES.post(post.id)}
        className="group bg-ig-bg-secondary relative block size-full overflow-hidden"
      >
        {url ? (
          video ? (
            // `mediaPoster` already resolved a thumbnail (or the #t=0.1 fallback).
            <video
              src={url}
              muted
              playsInline
              preload="metadata"
              className="size-full object-cover"
            />
          ) : (
            <Image
              src={url}
              alt={post.caption ?? ""}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              style={{ filter: filterCss(cover?.filter) }}
              className="object-cover"
            />
          )
        ) : null}

        {isCarousel(post) ? (
          <CarouselIcon className="absolute top-2 right-2 size-[18px] text-white drop-shadow" />
        ) : video ? (
          <ClipIcon className="absolute top-2 right-2 size-[18px] text-white drop-shadow" />
        ) : null}

        <div className="absolute inset-0 flex items-center justify-center gap-7 bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="flex items-center gap-1.5 font-semibold text-white">
            <HeartIcon filled className="size-5" />
            <span aria-label={likeLabel}>{formatCount(post.likesCount)}</span>
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-white">
            <CommentIcon className="size-5 [&_path]:fill-white" />
            {formatCount(post.commentsCount)}
          </span>
        </div>
      </Link>
    </li>
  );
}
