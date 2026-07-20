"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { HeartIcon } from "@/components/icons";
import { PostMusicStrip } from "@/components/music/PostMusicStrip";
import { PostActions } from "@/components/post/PostActions";
import { PostLikesDialog } from "@/components/post/PostLikesDialog";
import { PostCarousel } from "@/components/post/PostCarousel";
import { CommentForm } from "@/components/post/PostComments";
import { PostHeader } from "@/components/post/PostHeader";
import { RichCaption } from "@/components/post/RichCaption";
import { useLikePost, useViewPost } from "@/hooks/usePosts";
import { Link, useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { formatCount } from "@/lib/utils";
import type { PostDto } from "@/types/post.types";

const CAPTION_CLAMP = 100;

/** One feed post (docs/screenshots/img10, img11): header, media, actions, caption, comments. */
export function PostCard({ post }: { post: PostDto }) {
  const t = useTranslations("post");
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [burst, setBurst] = useState(false);
  const [likesOpen, setLikesOpen] = useState(false);

  const like = useLikePost();
  const viewPost = useViewPost();
  const ref = useRef<HTMLElement>(null);

  // view-post fires once per post, when half of the card has been on screen.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          viewPost(post.id);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [post.id, viewPost]);

  const onDoubleTap = () => {
    setBurst(true);
    window.setTimeout(() => setBurst(false), 700);
    if (!post.isLiked) like.mutate(post);
  };

  const caption = post.caption ?? "";
  const isLong = caption.length > CAPTION_CLAMP;
  const shown = expanded || !isLong ? caption : `${caption.slice(0, CAPTION_CLAMP)}…`;

  return (
    <article ref={ref} className="border-ig-separator mb-4 border-b pb-4">
      <PostHeader post={post} />

      <div className="relative">
        <PostCarousel
          media={post.media}
          alt={caption}
          onDoubleTap={onDoubleTap}
          // Rounded + hairline border is current IG's feed card; the old
          // square-cornered media read as a raw image dropped on the page.
          className="border-ig-separator overflow-hidden rounded-lg border"
        />

        <AnimatePresence>
          {burst ? (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
              exit={{ scale: 1.3, opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <HeartIcon filled className="size-24 text-white drop-shadow-lg" />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {post.music ? <PostMusicStrip music={post.music} /> : null}

      {/* The count opens the real list — softclub could only ever show a number.
          Inline next to the heart, not on its own line — matches current IG's
          feed-card look rather than the old stacked count. */}
      <PostActions
        post={post}
        showCounts
        onLikesCountClick={() => setLikesOpen(true)}
        onCommentClick={() => router.push(ROUTES.post(post.id))}
        className="pt-3"
      />

      {caption ? (
        <p className="text-ig-text pt-2 text-sm break-words whitespace-pre-line">
          <Link href={ROUTES.profile(post.author.id)} className="mr-1.5 font-semibold">
            {post.author.userName}
          </Link>
          <RichCaption text={shown} />
          {isLong && !expanded ? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="text-ig-text-secondary ml-1"
            >
              {t("more")}
            </button>
          ) : null}
        </p>
      ) : null}

      {post.commentsCount > 0 ? (
        <Link
          href={ROUTES.post(post.id)}
          className="text-ig-text-secondary mt-1.5 block text-sm hover:opacity-60"
        >
          {t("viewAllComments", { count: formatCount(post.commentsCount) })}
        </Link>
      ) : null}

      {post.commentsDisabled ? null : (
        <CommentForm postId={post.id} className="border-ig-separator mt-2 border-t" />
      )}

      <PostLikesDialog postId={post.id} open={likesOpen} onOpenChange={setLikesOpen} />
    </article>
  );
}
