"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { ReelsIcon } from "@/components/icons";
import { ReelCard } from "@/components/reel/ReelCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { Skeleton } from "@/components/ui/skeleton";
import { useReels } from "@/hooks/usePosts";
import { flattenPages } from "@/lib/cursor";

/**
 * /reels — one reel per viewport, CSS scroll-snap on the container.
 * Keyboard: ↑/↓ move between reels, Space plays/pauses, M mutes.
 */
export function ReelsFeed() {
  const t = useTranslations("reels");
  const { data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useReels();

  const [muted, setMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const videos = useRef(new Map<number, HTMLVideoElement>());

  const registerVideo = useCallback((postId: number, element: HTMLVideoElement | null) => {
    if (element) videos.current.set(postId, element);
    else videos.current.delete(postId);
  }, []);

  // Flip every mounted <video>'s `.muted` synchronously, in the same task as
  // the click / keypress that requested it — some browsers only allow
  // unmuting playing media inside the original user-gesture call stack, so
  // waiting for the `muted` prop to flow back down through a render + effect
  // is one tick too late and the video stays silent.
  const toggleMuted = useCallback(() => {
    setMuted((value) => {
      const next = !value;
      for (const video of videos.current.values()) video.muted = next;
      return next;
    });
  }, []);

  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !isFetchingNextPage) void fetchNextPage();
      },
      { rootMargin: "800px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const container = containerRef.current;
      if (!container) return;

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        container.scrollBy({
          top: event.key === "ArrowDown" ? window.innerHeight : -window.innerHeight,
          behavior: "smooth",
        });
      }

      if (event.key === "m" || event.key === "M") toggleMuted();

      if (event.key === " ") {
        event.preventDefault();
        // Toggle whichever reel is currently on screen.
        for (const video of videos.current.values()) {
          const box = video.getBoundingClientRect();
          if (box.top < window.innerHeight / 2 && box.bottom > window.innerHeight / 2) {
            if (video.paused) void video.play();
            else video.pause();
          }
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleMuted]);

  if (isPending) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <Skeleton className="h-[92dvh] w-[420px] rounded-lg" />
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={() => void refetch()} className="py-20" />;

  const reels = flattenPages(data);

  if (reels.length === 0) {
    return (
      <EmptyState
        icon={<ReelsIcon className="size-8" />}
        title={t("empty")}
        description={t("emptyDescription")}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-dvh snap-y snap-mandatory scrollbar-none overflow-y-scroll overscroll-contain"
    >
      {reels.map((post) => (
        <ReelCard
          key={post.id}
          post={post}
          muted={muted}
          onToggleMute={toggleMuted}
          registerVideo={registerVideo}
        />
      ))}
      <div ref={sentinel} className="h-4" />
      {isFetchingNextPage ? <Loader /> : null}
    </div>
  );
}
