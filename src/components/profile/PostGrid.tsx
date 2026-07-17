"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { CarouselIcon, ClipIcon, CommentIcon, HeartIcon } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { filterCss } from "@/lib/filters";
import { formatCount, getImageUrl } from "@/lib/utils";
import { coverMedia, isCarousel, isVideo, mediaPoster, type PostDto } from "@/types/post.types";

/**
 * IG's 3-column grid: square tiles, 4px gutters, hover reveals likes/comments
 * over a 30% black scrim (docs/screenshots/img35).
 */
export function PostGrid({ posts }: { posts: PostDto[] }) {
  return (
    <ul className="grid grid-cols-3 gap-1">
      {posts.map((post) => (
        <PostGridItem key={post.id} post={post} />
      ))}
    </ul>
  );
}

function PostGridItem({ post }: { post: PostDto }) {
  const t = useTranslations("post");
  const cover = coverMedia(post);
  const url = cover ? getImageUrl(mediaPoster(cover)) : null;
  const video = Boolean(cover && isVideo(cover));

  return (
    <li className="relative aspect-square">
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
              sizes="(max-width: 768px) 33vw, 310px"
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
            <span aria-label={t("like")}>{formatCount(post.likesCount)}</span>
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-white">
            <CommentIcon className="size-5 [&_path]:fill-white" />
            <span aria-label={t("comment")}>{formatCount(post.commentsCount)}</span>
          </span>
        </div>
      </Link>
    </li>
  );
}

export function PostGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-1">
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} className="aspect-square rounded-none" />
      ))}
    </div>
  );
}
