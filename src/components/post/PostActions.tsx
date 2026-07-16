"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { BookmarkIcon, CommentIcon, HeartIcon, ShareIcon } from "@/components/icons";
import { ShareSheet } from "@/components/post/ShareSheet";
import { useLikePost, useSavePost } from "@/hooks/usePosts";
import { cn } from "@/lib/utils";
import type { PostDto } from "@/types/post.types";

/** Like / comment / share on the left, save on the right (docs/screenshots/img11). */
export function PostActions({
  post,
  onCommentClick,
  className,
}: {
  post: PostDto;
  onCommentClick?: () => void;
  className?: string;
}) {
  const t = useTranslations("post");
  const [shareOpen, setShareOpen] = useState(false);
  const like = useLikePost();
  const save = useSavePost();

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label={t("like")}
          aria-pressed={post.isLiked}
          onClick={() => like.mutate(post)}
          className={cn(
            "transition-transform active:scale-90",
            post.isLiked ? "text-ig-danger" : "text-ig-text hover:opacity-60",
          )}
        >
          <HeartIcon filled={post.isLiked} className="size-6" />
        </button>

        <button
          type="button"
          aria-label={t("comment")}
          onClick={onCommentClick}
          className="text-ig-text hover:opacity-60"
        >
          <CommentIcon className="size-6" />
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
        aria-pressed={post.isFavorited}
        onClick={() => save.mutate(post)}
        className="text-ig-text hover:opacity-60"
      >
        <BookmarkIcon filled={post.isFavorited} className="size-6" />
      </button>

      <ShareSheet postId={post.id} open={shareOpen} onOpenChange={setShareOpen} />
    </div>
  );
}
