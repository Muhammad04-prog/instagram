"use client";

import { Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePost } from "@/hooks/usePosts";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { getImageUrl } from "@/lib/utils";
import { coverMedia, isVideo as isVideoMedia, mediaPoster } from "@/types/post.types";

/**
 * A shared post/reel inside a chat bubble (img12/img16-style share sheet
 * result) — `MessageDto.sharedPostId` is just a bare id, so this fetches the
 * post itself for its cover, the same way `PostGrid` resolves a tile. Tapping
 * opens the real post view (`PostModal`'s intercepted route), matching IG.
 */
export function SharedPostBubble({ postId }: { postId: number }) {
  const t = useTranslations("chat");
  const { data: post, isPending, isError } = usePost(postId);

  if (isPending) {
    return <div className="bg-ig-button-secondary mb-1 h-60 w-52 animate-pulse rounded-2xl" />;
  }

  if (isError || !post) {
    return (
      <div className="bg-ig-button-secondary text-ig-text-secondary mb-1 flex h-40 w-52 items-center justify-center rounded-2xl text-sm">
        {t("sharedPostUnavailable")}
      </div>
    );
  }

  const cover = coverMedia(post);
  const url = cover ? getImageUrl(mediaPoster(cover)) : null;
  const hasVideo = Boolean(cover && isVideoMedia(cover));

  return (
    <Link
      href={ROUTES.post(postId)}
      className="relative mb-1 block h-60 w-52 overflow-hidden rounded-2xl bg-black"
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- fixed-size chat thumbnail, no responsive srcset needed
        <img src={url} alt={post.caption ?? ""} className="size-full object-cover" />
      ) : null}

      {hasVideo ? (
        <span className="absolute inset-0 flex items-center justify-center bg-black/10">
          <span className="flex size-11 items-center justify-center rounded-full bg-black/50">
            <Play className="ml-0.5 size-5 fill-white text-white" />
          </span>
        </span>
      ) : null}
    </Link>
  );
}
