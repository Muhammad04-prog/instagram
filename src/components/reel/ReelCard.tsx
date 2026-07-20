"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Music2, Repeat2, Volume2, VolumeX, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { BookmarkIcon, CommentIcon, HeartIcon, ShareIcon } from "@/components/icons";
import { CommentForm, CommentList } from "@/components/post/PostComments";
import { PostOptionsMenu } from "@/components/post/PostOptionsMenu";
import { ShareSheet } from "@/components/post/ShareSheet";
import { FollowButton } from "@/components/profile/FollowButton";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useLikePost, useSavePost, useViewPost } from "@/hooks/usePosts";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { cn, formatCount, getImageUrl } from "@/lib/utils";
import { coverMedia, isVideo, type PostDto } from "@/types/post.types";

/**
 * One snap-scrolled reel (docs/screenshots/img16, img17): the video centred,
 * the action rail on its right, author + caption bottom-left, mute in the
 * video's bottom-right corner.
 *
 * Autoplay only works muted — browsers block sound without a user gesture — so
 * `muted` is owned by the page and toggled by the speaker button / the M key.
 */
export function ReelCard({
  post,
  muted,
  onToggleMute,
  registerVideo,
}: {
  post: PostDto;
  muted: boolean;
  onToggleMute: () => void;
  registerVideo: (postId: number, element: HTMLVideoElement | null) => void;
}) {
  const t = useTranslations("post");
  const { user } = useAuth();
  const like = useLikePost();
  const save = useSavePost();
  const viewPost = useViewPost();

  const containerRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [burst, setBurst] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  // Some rows' video points at a broken storage URL (see docs/BACKEND_REQUEST.md
  // #4 — Cloudinary's fetch delivery 404s) — this swaps the player for a plain
  // placeholder instead of a black, silently-stuck `<video>`.
  const [videoFailed, setVideoFailed] = useState(false);

  const cover = coverMedia(post);
  // Some rows in the live data are "reels" with only an IMAGE attached (no
  // video was ever uploaded) — feeding that url to <video src> fails outright
  // (black frame, no sound, MEDIA_ERR_SRC_NOT_SUPPORTED). Render it as a still
  // image instead of crashing playback. See docs/BACKEND_REQUEST.md.
  const hasVideo = Boolean(cover && isVideo(cover));
  const url = cover ? (getImageUrl(cover.url) ?? "") : "";
  const isMine = post.author.id === user?.id;

  const onDoubleTap = () => {
    setBurst(true);
    window.setTimeout(() => setBurst(false), 700);
    if (!post.isLiked) like.mutate(post);
  };

  // Play while at least half of the reel is on screen, pause when it leaves.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          const video = ref.current;
          if (video?.src) {
            video
              .play()
              .then(() => setPlaying(true))
              .catch(() => setPlaying(false));
          }
          viewPost(post.id);
        } else {
          ref.current?.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.6 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [post.id, viewPost]);

  useEffect(() => {
    if (!hasVideo) return;
    registerVideo(post.id, ref.current);
    return () => registerVideo(post.id, null);
  }, [post.id, registerVideo, hasVideo]);

  const togglePlay = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      if (video.src) {
        video
          .play()
          .then(() => setPlaying(true))
          .catch(() => setPlaying(false));
      }
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  return (
    <section className="flex h-dvh snap-start snap-always items-center justify-center gap-4 md:px-4">
      <div
        ref={containerRef}
        className="relative h-full w-full max-w-[420px] overflow-hidden bg-black md:max-h-[92dvh] md:rounded-lg"
      >
        {hasVideo && videoFailed ? (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-white/70">
            <VolumeX className="size-8" />
            <p className="text-sm">{t("videoUnavailable")}</p>
          </div>
        ) : hasVideo ? (
          <video
            ref={ref}
            // #t=0.1 paints a first frame even where autoplay is refused (mobile).
            src={url ? `${url}#t=0.1` : undefined}
            loop
            muted={muted}
            playsInline
            onClick={togglePlay}
            onDoubleClick={onDoubleTap}
            onError={() => setVideoFailed(true)}
            className="size-full object-contain"
          />
        ) : (
          // No video attached to this "reel" (backend data gap) — show the
          // still instead of a video element that would just fail to load.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={post.caption ?? ""}
            onDoubleClick={onDoubleTap}
            className="size-full object-contain"
          />
        )}

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

        {hasVideo && !videoFailed && !playing ? (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="size-16 rounded-full bg-black/40" />
          </span>
        ) : null}

        {hasVideo && !videoFailed ? (
          <button
            type="button"
            aria-label={muted ? t("unmute") : t("mute")}
            onClick={onToggleMute}
            className="absolute right-3 bottom-3 rounded-full bg-black/50 p-2 text-white"
          >
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>
        ) : null}

        {/* Sits above the 48px MobileNav on phones. `pointer-events-none` on the
            wrapper stops its empty right-hand strip from stealing clicks meant
            for the mute button (right-3 bottom-3) that sits under it — the
            block spans the full width regardless of how little text is in it,
            so without this every click there silently missed. */}
        <div className="pointer-events-none absolute right-0 bottom-16 left-0 px-4 text-white md:bottom-4">
          <div className="pointer-events-auto mb-2 flex items-center gap-3">
            <Link href={ROUTES.profile(post.author.id)}>
              <UserAvatar src={post.author.avatarUrl} alt={post.author.userName ?? ""} size={32} />
            </Link>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Link
                  href={ROUTES.profile(post.author.id)}
                  className="text-[15px] font-semibold drop-shadow-md"
                >
                  {post.author.userName}
                </Link>
                {isMine ? null : (
                  <FollowButton
                    userId={post.author.id}
                    userName={post.author.userName ?? ""}
                    variant="link"
                    className="h-6 rounded border border-white bg-transparent px-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-white/10"
                  />
                )}
              </div>
              {post.music ? (
                <p className="pointer-events-none mt-0.5 flex items-center gap-1.5 text-xs drop-shadow-md">
                  <Music2 className="size-3 shrink-0" />
                  <span className="truncate">
                    {post.music.title} · {post.music.artist}
                  </span>
                </p>
              ) : null}
            </div>
          </div>

          {post.caption ? (
            <p className="pointer-events-auto line-clamp-2 max-w-[80%] text-sm drop-shadow-md">
              {post.caption}
            </p>
          ) : null}

          {post.remixOf ? (
            <Link
              href={ROUTES.post(post.remixOf.id)}
              className="pointer-events-auto mt-1 flex items-center gap-1 text-xs text-white/80 drop-shadow-md"
            >
              <Repeat2 className="size-3.5" />
              {t("remixOf", { userName: post.remixOf.author.userName })}
            </Link>
          ) : null}
        </div>

        {/* Mobile: the rail floats over the video. Desktop: it sits beside the
            card, as in docs/screenshots/img16. */}
        <div className="absolute right-2 bottom-24 flex flex-col items-center gap-5 text-white md:hidden">
          <ActionRail
            post={post}
            onLike={() => like.mutate(post)}
            onSave={() => save.mutate({ post })}
            onOpenComments={() => setCommentsOpen(true)}
            onShare={() => setShareOpen(true)}
          />
        </div>
      </div>

      <div className="text-ig-text hidden h-[92dvh] flex-col items-center justify-end gap-5 pb-6 md:flex">
        <ActionRail
          post={post}
          onLike={() => like.mutate(post)}
          onSave={() => save.mutate({ post })}
          onOpenComments={() => setCommentsOpen(true)}
          onShare={() => setShareOpen(true)}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="Cover"
          className="mt-2 size-7 rounded border-2 border-white/80 object-cover shadow"
        />
      </div>

      <CommentsSheet
        postId={post.id}
        postAuthorId={post.author.id}
        commentsDisabled={post.commentsDisabled}
        open={commentsOpen}
        onOpenChange={setCommentsOpen}
      />
      <ShareSheet postId={post.id} open={shareOpen} onOpenChange={setShareOpen} />
    </section>
  );
}

/** Comments without leaving the reels feed — a right-side panel over the video. */
function CommentsSheet({
  postId,
  postAuthorId,
  commentsDisabled,
  open,
  onOpenChange,
}: {
  postId: number;
  postAuthorId: string;
  commentsDisabled: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("post");
  const tCommon = useTranslations("common");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* `dark` scopes every --ig-* token inside to its dark values — Reels
          stays a dark, immersive surface regardless of the site theme, the
          same way the reel video itself always sits on black. */}
      <SheetContent
        side="right"
        showCloseButton={false}
        className="bg-ig-elevated text-ig-text z-50 flex h-[80vh] w-full flex-col rounded-t-2xl !border-none p-0 shadow-2xl md:!fixed md:!inset-auto md:!top-1/2 md:!left-[calc(50%+260px)] md:!h-[550px] md:!w-[350px] md:!max-w-[350px] md:!-translate-y-1/2 md:!rounded-xl"
      >
        <SheetHeader className="border-ig-border flex-row items-center justify-between border-b px-4 py-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label={tCommon("close")}
            className="text-ig-text-secondary hover:text-ig-text transition"
          >
            <X className="size-6" />
          </button>
          <SheetTitle className="text-ig-text flex-1 text-center text-base font-semibold">
            {t("commentsTitle")}
          </SheetTitle>
          <span className="size-6" aria-hidden />
        </SheetHeader>

        <CommentList
          postId={postId}
          postAuthorId={postAuthorId}
          className="flex-1 overflow-y-auto px-4 py-4"
        />

        {commentsDisabled ? null : (
          <div className="border-ig-border border-t p-4">
            <CommentForm postId={postId} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ActionRail({
  post,
  onLike,
  onSave,
  onOpenComments,
  onShare,
}: {
  post: PostDto;
  onLike: () => void;
  onSave: () => void;
  onOpenComments: () => void;
  onShare: () => void;
}) {
  const t = useTranslations("post");

  return (
    <>
      <Action
        label={t("like")}
        count={post.likesCount ?? undefined}
        active={post.isLiked}
        onClick={onLike}
        icon={<HeartIcon filled={post.isLiked} className="size-7 drop-shadow" />}
      />
      <Action
        label={t("comment")}
        count={post.commentsCount}
        onClick={onOpenComments}
        icon={<CommentIcon className="size-7 drop-shadow" />}
      />
      <Action
        label={t("share")}
        onClick={onShare}
        icon={<ShareIcon className="size-7 drop-shadow" />}
      />
      <Action
        label={t("save")}
        active={post.isFavorited}
        onClick={onSave}
        icon={<BookmarkIcon filled={post.isFavorited} className="size-7 drop-shadow" />}
      />
      <PostOptionsMenu
        post={post}
        triggerClassName="flex flex-col items-center gap-1 drop-shadow"
      />
    </>
  );
}

function Action({
  icon,
  label,
  count,
  active,
  onClick,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
  href?: string;
}) {
  const content = (
    <>
      {/* Colour is inherited from the rail: white over the video on mobile, the
          theme's text colour beside the card on desktop. */}
      <span className={cn(active && "text-ig-danger")}>{icon}</span>
      {typeof count === "number" ? (
        <span className="text-xs font-semibold">{formatCount(count)}</span>
      ) : null}
    </>
  );

  const className = "flex flex-col items-center gap-1";

  if (href) {
    return (
      <Link href={href} aria-label={label} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" aria-label={label} onClick={onClick} className={className}>
      {content}
    </button>
  );
}
