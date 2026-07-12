"use client";

import { useFormatter, useTranslations } from "next-intl";
import { PostActions } from "@/components/post/PostActions";
import { PostCarousel } from "@/components/post/PostCarousel";
import { CommentForm, CommentList } from "@/components/post/PostComments";
import { PostHeader } from "@/components/post/PostHeader";
import { PostDetailSkeleton } from "@/components/post/PostSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { usePost } from "@/hooks/usePosts";
import { Link, useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Post view used by both `/post/[id]` and the intercepted modal
 * (docs/screenshots/img12): media on the left, header + caption + comments on
 * the right, actions and the comment box pinned to the bottom of that column.
 */
export function PostDetail({ postId, onClose }: { postId: number; onClose?: () => void }) {
  const t = useTranslations("post");
  const format = useFormatter();
  const router = useRouter();
  const { data: post, isPending, isError, refetch } = usePost(postId);

  if (isPending) return <PostDetailSkeleton />;
  if (isError || !post) return <ErrorState onRetry={() => void refetch()} className="py-20" />;

  const onDeleted = () => {
    if (onClose) onClose();
    else router.push(ROUTES.home);
  };

  return (
    <div className="flex max-h-[90vh] flex-col md:flex-row">
      <div className="bg-black md:flex md:w-[60%] md:items-center">
        <PostCarousel images={post.images} alt={post.content ?? ""} className="w-full" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <PostHeader
          post={post}
          onDeleted={onDeleted}
          className="border-ig-separator shrink-0 border-b px-4"
        />

        <div className="flex-1 scrollbar-none overflow-y-auto px-4 py-4">
          {post.content ? (
            <div className="mb-4 flex gap-3">
              <Link href={ROUTES.profile(post.userId)}>
                <UserAvatar src={post.userImage} alt={post.userName ?? ""} size={32} />
              </Link>
              <p className="text-ig-text text-sm break-words whitespace-pre-line">
                <Link href={ROUTES.profile(post.userId)} className="mr-1.5 font-semibold">
                  {post.userName}
                </Link>
                {post.content}
              </p>
            </div>
          ) : null}

          <CommentList post={post} />
        </div>

        <div className="border-ig-separator shrink-0 border-t px-4">
          <PostActions post={post} className="pt-3" />

          <p className={cn("text-ig-text pt-2 text-sm font-semibold")}>
            {t("likes", { count: post.postLikeCount })}
          </p>
          <time
            dateTime={post.datePublished}
            className="text-ig-text-secondary text-xs"
            suppressHydrationWarning
          >
            {format.relativeTime(new Date(post.datePublished), new Date())}
          </time>

          <CommentForm postId={post.postId} className="border-ig-separator mt-2 border-t" />
        </div>
      </div>
    </div>
  );
}
