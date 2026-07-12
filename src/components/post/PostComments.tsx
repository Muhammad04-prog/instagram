"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useAddComment, useDeleteComment } from "@/hooks/useComments";
import { useAuth } from "@/hooks/useAuth";
import { useProfileLite } from "@/hooks/useProfile";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Comment, Post } from "@/types/post.types";

/** Comment list of the post modal / page (docs/screenshots/img12, right column). */
export function CommentList({ post, className }: { post: Post; className?: string }) {
  const t = useTranslations("post");
  const comments = post.comments ?? [];

  if (comments.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-10 text-center", className)}>
        <p className="text-ig-text text-xl font-semibold">{t("noComments")}</p>
        <p className="text-ig-text-secondary mt-1 text-sm">{t("noCommentsDescription")}</p>
      </div>
    );
  }

  return (
    <ul className={cn("space-y-4", className)}>
      {comments.map((comment) => (
        <CommentItem key={comment.postCommentId} comment={comment} postId={post.postId} />
      ))}
    </ul>
  );
}

function CommentItem({ comment, postId }: { comment: Comment; postId: number }) {
  const t = useTranslations("common");
  const format = useFormatter();
  const { user } = useAuth();
  const remove = useDeleteComment(postId);

  // The API nulls userName/userImage inside comments[], so fall back to the
  // author's profile (cached per user).
  const author = useProfileLite(comment.userId, !comment.userName);
  const userName = comment.userName ?? author.data?.userName ?? "";
  const userImage = comment.userImage ?? author.data?.image ?? null;

  const isMine = comment.userId === user?.userId;

  return (
    <li className="group flex gap-3">
      <Link href={ROUTES.profile(comment.userId)}>
        <UserAvatar src={userImage} alt={userName} size={32} />
      </Link>

      <div className="min-w-0 flex-1">
        <p className="text-ig-text text-sm break-words">
          <Link href={ROUTES.profile(comment.userId)} className="mr-1.5 font-semibold">
            {userName}
          </Link>
          {comment.comment}
        </p>
        <div className="text-ig-text-secondary mt-1 flex items-center gap-3 text-xs">
          <time dateTime={comment.dateCommented} suppressHydrationWarning>
            {format.relativeTime(new Date(comment.dateCommented), new Date())}
          </time>
          {isMine ? (
            <button
              type="button"
              onClick={() => remove.mutate(comment.postCommentId)}
              disabled={remove.isPending}
              className="font-semibold opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
            >
              {t("delete")}
            </button>
          ) : null}
        </div>
      </div>
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
    const comment = value.trim();
    if (!comment) return;
    add.mutate({ postId, comment }, { onSuccess: () => setValue("") });
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
