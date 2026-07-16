"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { HeartIcon } from "@/components/icons";
import { PostActions } from "@/components/post/PostActions";
import { PostCarousel } from "@/components/post/PostCarousel";
import { CommentForm } from "@/components/post/PostComments";
import { PostHeader } from "@/components/post/PostHeader";
import { useLikePost, useViewPost } from "@/hooks/usePosts";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { formatCount } from "@/lib/utils";
import type { PostDto } from "@/types/post.types";

const CAPTION_CLAMP = 100;

/** One feed post (docs/screenshots/img10, img11): header, media, actions, caption, comments. */
export function PostCard({ post }: { post: PostDto }) {
  const t = useTranslations("post");
  const [expanded, setExpanded] = useState(false);
  const [burst, setBurst] = useState(false);

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
    <article ref={ref} className="border-ig-separator border-b pb-4">
      <PostHeader post={post} />

      <div className="relative">
        <PostCarousel
          media={post.media}
          alt={caption}
          onDoubleTap={onDoubleTap}
          className="overflow-hidden rounded-sm"
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

      <PostActions post={post} className="pt-2" />

      {post.likesCount > 0 ? (
        <p className="text-ig-text pt-1 text-sm font-semibold">
          {t("likes", { count: post.likesCount })}
        </p>
      ) : null}

      {caption ? (
        <p className="text-ig-text pt-1 text-sm break-words whitespace-pre-line">
          <Link href={ROUTES.profile(post.author.id)} className="mr-1.5 font-semibold">
            {post.author.userName}
          </Link>
          {shown}
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
        <Link href={ROUTES.post(post.id)} className="text-ig-text-secondary mt-1 block text-sm">
          {t("viewAllComments", { count: formatCount(post.commentsCount) })}
        </Link>
      ) : null}

      <CommentForm postId={post.id} className="border-ig-separator mt-1 border-t" />
    </article>
  );
}
