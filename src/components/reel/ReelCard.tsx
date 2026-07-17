"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { BookmarkIcon, CommentIcon, HeartIcon, ShareIcon } from "@/components/icons";
import { FollowButton } from "@/components/profile/FollowButton";
import { ReelMoreMenu } from "@/components/reel/ReelMoreMenu";
import { ShareDialog } from "@/components/shared/ShareDialog";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useAuth } from "@/hooks/useAuth";
import { useLikePost, useSavePost, useViewPost } from "@/hooks/usePosts";
import { Link } from "@/i18n/navigation";
import { ROUTES, SITE_URL } from "@/lib/constants";
import { cn, formatCount, getImageUrl } from "@/lib/utils";
import type { Post } from "@/types/post.types";

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
  post: Post;
  muted: boolean;
  onToggleMute: () => void;
  registerVideo: (postId: number, element: HTMLVideoElement | null) => void;
}) {
  const t = useTranslations("post");
  const { user } = useAuth();
  const like = useLikePost();
  const save = useSavePost();
  const viewPost = useViewPost();

  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const file = post.images[0] ?? "";
  const url = getImageUrl(file) ?? "";
  const isMine = post.userId === user?.userId;

  // React's `muted` JSX prop only sets the DOM attribute (the *default* muted
  // state); it does not reliably update the live `.muted` property once the
  // element has already started playing in every browser. Set it directly so
  // the speaker button / M key actually (un)mutes an already-playing reel.
  useEffect(() => {
    const video = ref.current;
    if (video) video.muted = muted;
  }, [muted]);

  // Play while at least half of the reel is on screen, pause when it leaves.
  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    registerVideo(post.postId, video);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          void video
            .play()
            .then(() => setPlaying(true))
            .catch(() => setPlaying(false));
          viewPost(post.postId);
        } else {
          video.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.6 },
    );

    observer.observe(video);
    return () => {
      observer.disconnect();
      registerVideo(post.postId, null);
    };
  }, [post.postId, registerVideo, viewPost]);

  const togglePlay = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      void video
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  return (
    <section className="flex h-dvh snap-start snap-always items-center justify-center gap-4 md:px-4">
      <div className="relative h-full w-full max-w-[420px] overflow-hidden bg-black md:max-h-[92dvh] md:rounded-lg">
        <video
          ref={ref}
          // #t=0.1 paints a first frame even where autoplay is refused (mobile).
          src={`${url}#t=0.1`}
          loop
          muted={muted}
          playsInline
          onClick={togglePlay}
          onDoubleClick={() => !post.postLike && like.mutate(post)}
          className="size-full object-contain"
        />

        {!playing ? (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="size-16 rounded-full bg-black/40" />
          </span>
        ) : null}

        {/* bottom-16 clears the 48px MobileNav (same offset as the caption
            block below); md:bottom-3 tucks it back into the corner once that
            bar is gone. */}
        <button
          type="button"
          aria-label={muted ? t("unmute") : t("mute")}
          onClick={onToggleMute}
          className="absolute right-3 bottom-16 z-10 rounded-full bg-black/50 p-2 text-white md:bottom-3"
        >
          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>

        {/* Sits above the 48px MobileNav on phones. */}
        <div className="absolute right-0 bottom-16 left-0 px-4 text-white md:bottom-4">
          <div className="mb-2 flex items-center gap-2">
            <Link href={ROUTES.profile(post.userId)}>
              <UserAvatar src={post.userImage} alt={post.userName ?? ""} size={32} />
            </Link>
            <Link href={ROUTES.profile(post.userId)} className="text-sm font-semibold">
              {post.userName}
            </Link>
            {isMine ? null : (
              <FollowButton
                userId={post.userId}
                userName={post.userName ?? ""}
                variant="link"
                className="text-white"
              />
            )}
          </div>
          {post.content ? <p className="line-clamp-2 max-w-[70%] text-sm">{post.content}</p> : null}
        </div>

        {/* Mobile: the rail floats over the video. Desktop: it sits beside the
            card, as in docs/screenshots/img16. */}
        <div className="absolute right-2 bottom-24 flex flex-col items-center gap-5 text-white md:hidden">
          <ActionRail
            post={post}
            onLike={() => like.mutate(post)}
            onSave={() => save.mutate(post)}
            onShare={() => setShareOpen(true)}
          />
        </div>
      </div>

      <div className="text-ig-text hidden flex-col items-center gap-5 pb-10 md:flex">
        <ActionRail
          post={post}
          onLike={() => like.mutate(post)}
          onSave={() => save.mutate(post)}
          onShare={() => setShareOpen(true)}
        />
      </div>

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        url={`${SITE_URL}${ROUTES.post(post.postId)}`}
      />
    </section>
  );
}

function ActionRail({
  post,
  onLike,
  onSave,
  onShare,
}: {
  post: Post;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
}) {
  const t = useTranslations("post");

  return (
    <>
      <Action
        label={t("like")}
        count={post.postLikeCount}
        active={post.postLike}
        onClick={onLike}
        icon={<HeartIcon filled={post.postLike} className="size-6" />}
      />
      <Action
        label={t("comment")}
        count={post.commentCount}
        href={ROUTES.post(post.postId)}
        icon={<CommentIcon className="size-6" />}
      />
      <Action label={t("share")} onClick={onShare} icon={<ShareIcon className="size-6" />} />
      <Action
        label={t("save")}
        active={post.postFavorite}
        onClick={onSave}
        icon={<BookmarkIcon filled={post.postFavorite} className="size-6" />}
      />
      <ReelMoreMenu post={post} onShare={onShare} />
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
