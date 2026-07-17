"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { HeartIcon } from "@/components/icons";
import { Loader } from "@/components/shared/Loader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import {
  useAddComment,
  useCommentReplies,
  useComments,
  useDeleteComment,
  useLikeComment,
  useReplyToComment,
} from "@/hooks/useComments";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { RichCaption } from "@/components/post/RichCaption";
import { cn, formatCount } from "@/lib/utils";
import type { CommentDto } from "@/types/api.types";
import { flattenPages } from "@/lib/cursor";

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

  const comments = flattenPages(data);

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
          <CommentThread key={comment.id} comment={comment} postId={postId} />
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

function CommentItem({
  comment,
  postId,
  onReply,
}: {
  comment: CommentDto;
  postId: number;
  /** Absent on a reply — IG's threads are one level deep. */
  onReply?: () => void;
}) {
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
          <RichCaption text={comment.text} />
        </p>

        <div className="text-ig-text-secondary mt-1 flex items-center gap-3 text-xs">
          <time dateTime={comment.createdAt} suppressHydrationWarning>
            {format.relativeTime(new Date(comment.createdAt), new Date())}
          </time>

          {comment.likesCount > 0 ? (
            <span className="font-semibold">{tPost("likes", { count: comment.likesCount })}</span>
          ) : null}

          {onReply ? (
            <button type="button" onClick={onReply} className="font-semibold">
              {tPost("reply")}
            </button>
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

/**
 * A root comment with its replies underneath.
 *
 * Threads are one level deep, as on IG: a reply has no Reply button of its own,
 * it just @mentions the person. `repliesCount` comes with the comment, so the
 * "View replies (N)" line can be drawn without fetching anything — the replies
 * themselves are only fetched when the line is clicked.
 */
function CommentThread({ comment, postId }: { comment: CommentDto; postId: number }) {
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [replying, setReplying] = useState(false);

  return (
    <li>
      <ul>
        <CommentItem comment={comment} postId={postId} onReply={() => setReplying(true)} />
      </ul>

      {replying ? (
        <ReplyForm
          postId={postId}
          commentId={comment.id}
          userName={comment.author.userName}
          onDone={() => {
            setReplying(false);
            setRepliesOpen(true);
          }}
        />
      ) : null}

      {comment.repliesCount > 0 ? (
        <ReplyThread
          comment={comment}
          postId={postId}
          open={repliesOpen}
          onToggle={() => setRepliesOpen((value) => !value)}
        />
      ) : null}
    </li>
  );
}

/** One level of replies, fetched only when the thread is opened. */
function ReplyThread({
  comment,
  postId,
  open,
  onToggle,
}: {
  comment: CommentDto;
  postId: number;
  open: boolean;
  onToggle: () => void;
}) {
  const tPost = useTranslations("post");
  const { data, isFetching } = useCommentReplies(comment.id, open);
  const replies = flattenPages(data);

  return (
    <div className="mt-2 ml-11 space-y-3">
      <button
        type="button"
        onClick={onToggle}
        className="text-ig-text-secondary flex items-center gap-3 text-xs font-semibold"
      >
        <span className="bg-ig-text-secondary block h-px w-6" />
        {open
          ? tPost("hideReplies")
          : tPost("viewReplies", { count: formatCount(comment.repliesCount) })}
      </button>

      {open && isFetching && replies.length === 0 ? (
        <p className="text-ig-text-secondary text-xs">{tPost("loadingReplies")}</p>
      ) : null}

      {open ? (
        <ul className="space-y-3">
          {replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} postId={postId} />
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Inline "reply to this comment" box. */
function ReplyForm({
  postId,
  commentId,
  userName,
  onDone,
}: {
  postId: number;
  commentId: number;
  userName: string;
  onDone: () => void;
}) {
  const t = useTranslations("post");
  // Pre-fills the @mention, exactly as IG does when you tap Reply.
  const [value, setValue] = useState(`@${userName} `);
  const reply = useReplyToComment(postId, commentId);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const text = value.trim();
        if (!text) return;
        reply.mutate({ text }, { onSuccess: onDone });
      }}
      className="mt-2 ml-11 flex items-center gap-2"
    >
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        autoFocus
        aria-label={t("reply")}
        className="border-ig-separator text-ig-text placeholder:text-ig-text-secondary flex-1 border-b bg-transparent pb-1 text-sm outline-none"
      />
      <button
        type="submit"
        disabled={!value.trim() || reply.isPending}
        className="text-ig-primary text-sm font-semibold disabled:opacity-40"
      >
        {t("publish")}
      </button>
    </form>
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
