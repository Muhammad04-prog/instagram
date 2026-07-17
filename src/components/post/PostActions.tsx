"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { BookmarkIcon, CommentIcon, HeartIcon, RepostIcon, ShareIcon } from "@/components/icons";
import { ShareDialog } from "@/components/shared/ShareDialog";
import { useLikePost, useSavePost } from "@/hooks/usePosts";
import { ROUTES, SITE_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Post } from "@/types/post.types";

/** Like / comment / share on the left, save on the right (docs/screenshots/img11). */
export function PostActions({
  post,
  onCommentClick,
  className,
}: {
  post: Post;
  onCommentClick?: () => void;
  className?: string;
}) {
  const t = useTranslations("post");
  const like = useLikePost();
  const save = useSavePost();
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label={t("like")}
          aria-pressed={post.postLike}
          onClick={() => like.mutate(post)}
          className={cn(
            "transition-transform active:scale-90",
            post.postLike ? "text-ig-danger" : "text-ig-text hover:opacity-60",
          )}
        >
          <HeartIcon filled={post.postLike} className="size-6" />
        </button>

        <button
          type="button"
          aria-label={t("comment")}
          onClick={onCommentClick}
          className="text-ig-text hover:opacity-60"
        >
          <CommentIcon className="size-6" />
        </button>

        {/* No repost endpoint exists on the backend (checked API_MAP + Swagger) — shown for
            parity with the current Instagram UI, disabled until the API supports it. */}
        <button
          type="button"
          aria-label={t("repost")}
          disabled
          className="text-ig-text cursor-not-allowed opacity-40"
        >
          <RepostIcon className="size-6" />
        </button>

        <button
          type="button"
          aria-label={t("share")}
          onClick={() => setShareOpen(true)}
          className="text-ig-text hover:opacity-60"
        >
          <ShareIcon className="size-6" />
        </button>
      </div>

      <button
        type="button"
        aria-label={t("save")}
        aria-pressed={post.postFavorite}
        onClick={() => save.mutate(post)}
        className="text-ig-text hover:opacity-60"
      >
        <BookmarkIcon filled={post.postFavorite} className="size-6" />
      </button>

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        url={`${SITE_URL}${ROUTES.post(post.postId)}`}
      />
    </div>
  );
}
