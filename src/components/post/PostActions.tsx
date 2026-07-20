"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { BookmarkIcon, CommentIcon, HeartIcon, ShareIcon } from "@/components/icons";
import { SaveToCollectionDialog } from "@/components/post/SaveToCollectionDialog";
import { ShareSheet } from "@/components/post/ShareSheet";
import { useLikePost, useSavePost } from "@/hooks/usePosts";
import { cn, formatCount } from "@/lib/utils";
import type { PostDto } from "@/types/post.types";

/** How long a press must last to mean "choose a collection" rather than "save". */
const HOLD_MS = 500;

/**
 * Like / comment / share on the left, save on the right (docs/screenshots/img11).
 *
 * `showCounts` puts the like/comment numbers right next to their icons —
 * real IG's current feed-card look — instead of the count living on its own
 * line below (still how the post-detail modal shows it, img12). There is no
 * "repost" action here: the API has `GET /profile/me/reposts` (reading what
 * you've reposted) but nothing that creates one, so a repost button would
 * press and do nothing real.
 */
export function PostActions({
  post,
  onCommentClick,
  onLikesCountClick,
  showCounts = false,
  className,
}: {
  post: PostDto;
  onCommentClick?: () => void;
  /** Only meaningful with `showCounts` — opens "who liked this". */
  onLikesCountClick?: () => void;
  showCounts?: boolean;
  className?: string;
}) {
  const t = useTranslations("post");
  const [shareOpen, setShareOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const like = useLikePost();
  const save = useSavePost();

  const holdTimer = useRef<number | undefined>(undefined);
  // Set when the hold fired, so the click that follows the release does not
  // also toggle the save.
  const heldRef = useRef(false);

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
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
          {showCounts && post.likesCount ? (
            <button
              type="button"
              onClick={onLikesCountClick}
              className="text-ig-text text-sm font-semibold hover:opacity-60"
            >
              {formatCount(post.likesCount)}
            </button>
          ) : null}
        </span>

        <span className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label={t("comment")}
            onClick={onCommentClick}
            className="text-ig-text hover:opacity-60"
          >
            <CommentIcon className="size-6" />
          </button>
          {showCounts && post.commentsCount > 0 ? (
            <span className="text-ig-text text-sm font-semibold">
              {formatCount(post.commentsCount)}
            </span>
          ) : null}
        </span>

        <button
          type="button"
          aria-label={t("share")}
          onClick={() => setShareOpen(true)}
          className="text-ig-text hover:opacity-60"
        >
          <ShareIcon className="size-6" />
        </button>
      </div>

      {/* Tap saves; press-and-hold files it under a collection — IG's gesture.
          The context menu is the keyboard/right-click route to the same thing,
          so the feature is not gated behind a gesture some people cannot make. */}
      <button
        type="button"
        aria-label={t("save")}
        aria-pressed={post.isFavorited}
        onClick={() => {
          if (heldRef.current) {
            heldRef.current = false;
            return;
          }
          save.mutate({ post });
        }}
        onPointerDown={() => {
          heldRef.current = false;
          holdTimer.current = window.setTimeout(() => {
            heldRef.current = true;
            setCollectionOpen(true);
          }, HOLD_MS);
        }}
        onPointerUp={() => window.clearTimeout(holdTimer.current)}
        onPointerLeave={() => window.clearTimeout(holdTimer.current)}
        onContextMenu={(event) => {
          event.preventDefault();
          setCollectionOpen(true);
        }}
        className="text-ig-text hover:opacity-60"
      >
        <BookmarkIcon filled={post.isFavorited} className="size-6" />
      </button>

      <ShareSheet postId={post.id} open={shareOpen} onOpenChange={setShareOpen} />
      <SaveToCollectionDialog post={post} open={collectionOpen} onOpenChange={setCollectionOpen} />
    </div>
  );
}
