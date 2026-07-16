"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { HeartIcon } from "@/components/icons";
import { Loader } from "@/components/shared/Loader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useAddComment, useComments, useDeleteComment, useLikeComment } from "@/hooks/useComments";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { cn, formatCount } from "@/lib/utils";
import type { CommentDto } from "@/types/api.types";

/**
 * Comment list of the post modal / page (docs/screenshots/img12, right column).
 *
 * Comments are their own paginated resource now, so this fetches instead of
 * reading `post.comments`. `author` comes populated — softclub nulled
 * `userName` / `userImage` on every comment, so Phase 5 had to look each writer
 * up by id (bug #6). Comment likes are new.
 */
export function CommentList({ postId, className }: { postId: number; className?: string }) {
  const t = useTranslations("post");
  const { data, isPending, hasNextPage, fetchNextPage, isFetchingNextPage } = useComments(postId);

  if (isPending) return <Loader className={className} />;

  const comments = data?.pages.flat() ?? [];

  if (comments.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-10 text-center", className)}>
        <p className="text-ig-text text-xl font-semibold">{t("noComments")}</p>
        <p className="text-ig-text-secondary mt-1 text-sm">{t("noCommentsDescription")}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ul className="space-y-4">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} postId={postId} />
        ))}
      </ul>

      {hasNextPage ? (
        <button
          type="button"
          onClick={() => void fetchNextPage()}
          disabled={isFetchingNextPage}
          className="text-ig-text-secondary mt-4 text-sm font-semibold disabled:opacity-50"
        >
          {t("loadMoreComments")}
        </button>
      ) : null}
    </div>
  );
}

function CommentItem({ comment, postId }: { comment: CommentDto; postId: number }) {
  const t = useTranslations("common");
  const tPost = useTranslations("post");
  const format = useFormatter();
  const remove = useDeleteComment(postId);
  const like = useLikeComment(postId);

  const { author } = comment;

  return (
    <li className="group flex gap-3">
      <Link href={ROUTES.profile(author.id)}>
        <UserAvatar src={author.avatarUrl ?? null} alt={author.userName} size={32} />
      </Link>

      <div className="min-w-0 flex-1">
        <p className="text-ig-text text-sm break-words">
          <Link href={ROUTES.profile(author.id)} className="mr-1.5 font-semibold">
            {author.userName}
          </Link>
          {comment.text}
        </p>

        <div className="text-ig-text-secondary mt-1 flex items-center gap-3 text-xs">
          <time dateTime={comment.createdAt} suppressHydrationWarning>
            {format.relativeTime(new Date(comment.createdAt), new Date())}
          </time>

          {comment.likesCount > 0 ? (
            <span className="font-semibold">{tPost("likes", { count: comment.likesCount })}</span>
          ) : null}

          {comment.repliesCount > 0 ? (
            <span className="font-semibold">
              {tPost("viewReplies", { count: formatCount(comment.repliesCount) })}
            </span>
          ) : null}

          {/* The server decides who may delete — no need to compare ids here. */}
          {comment.canDelete ? (
            <button
              type="button"
              onClick={() => remove.mutate(comment.id)}
              disabled={remove.isPending}
              className="font-semibold opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
            >
              {t("delete")}
            </button>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={() => like.mutate(comment.id)}
        aria-label={tPost("like")}
        aria-pressed={comment.isLiked}
        className="self-start pt-1"
      >
        <HeartIcon
          filled={comment.isLiked}
          className={cn("size-3", comment.isLiked ? "text-ig-danger" : "text-ig-text")}
        />
      </button>
    </li>
  );
}

/** «Добавьте комментарий…» + «Опубликовать» (docs/screenshots/img12, bottom). */
export function CommentForm({ postId, className }: { postId: number; className?: string }) {
  const t = useTranslations("post");
  const [value, setValue] = useState("");
  const add = useAddComment(postId);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const text = value.trim();
    if (!text) return;
    add.mutate({ text }, { onSuccess: () => setValue("") });
  };

  return (
    <form onSubmit={submit} className={cn("flex items-center gap-2 py-2", className)}>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={t("addComment")}
        aria-label={t("addComment")}
        className="text-ig-text placeholder:text-ig-text-secondary flex-1 bg-transparent text-sm outline-none"
      />
      <button
        type="submit"
        disabled={!value.trim() || add.isPending}
        className="text-ig-primary text-sm font-semibold disabled:opacity-40"
      >
        {t("publish")}
      </button>
    </form>
  );
}
