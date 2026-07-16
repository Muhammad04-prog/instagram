"use client";

import { useFormatter, useTranslations } from "next-intl";
import { toast } from "sonner";
import { useState } from "react";
import { DotsIcon } from "@/components/icons";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { UserNameWithBadge } from "@/components/shared/VerifiedBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useArchivePost, useDeletePost, useReportPost, useSharePost } from "@/hooks/usePosts";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { PostDto } from "@/types/post.types";

/** Avatar · username · relative time · «…» menu (docs/screenshots/img11, img13). */
export function PostHeader({
  post,
  onDeleted,
  className,
}: {
  post: PostDto;
  onDeleted?: () => void;
  className?: string;
}) {
  const t = useTranslations("post");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const { user } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const remove = useDeletePost();
  const archive = useArchivePost();
  const report = useReportPost(post.id);
  const share = useSharePost(post.id);

  const isMine = post.author.id === user?.id;

  return (
    <div className={cn("flex items-center gap-3 py-3", className)}>
      <Link href={ROUTES.profile(post.author.id)}>
        <UserAvatar src={post.author.avatarUrl} alt={post.author.userName ?? ""} size={32} />
      </Link>

      <div className="flex min-w-0 flex-1 items-center gap-1 text-sm">
        <Link
          href={ROUTES.profile(post.author.id)}
          className="text-ig-text min-w-0 font-semibold hover:opacity-60"
        >
          <UserNameWithBadge userName={post.author.userName} isVerified={post.author.isVerified} />
        </Link>
        <span className="text-ig-text-secondary">·</span>
        <time
          dateTime={post.createdAt}
          className="text-ig-text-secondary shrink-0"
          suppressHydrationWarning
        >
          {format.relativeTime(new Date(post.createdAt), new Date())}
        </time>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" aria-label={tCommon("more")} className="text-ig-text">
            <DotsIcon className="size-6" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-ig-elevated">
          <DropdownMenuItem asChild>
            <Link href={ROUTES.post(post.id)}>{t("goToPost")}</Link>
          </DropdownMenuItem>
          {/* One call now: the server builds the story from the post itself. */}
          <DropdownMenuItem
            onSelect={() =>
              share.mutate(
                { toStory: true },
                { onSuccess: () => toast.success(t("sharedToStory")) },
              )
            }
          >
            {t("shareToStory")}
          </DropdownMenuItem>

          {isMine ? (
            <DropdownMenuItem
              onSelect={() =>
                archive.mutate(
                  { postId: post.id, archive: !post.isArchived },
                  {
                    onSuccess: () => toast.success(post.isArchived ? t("restored") : t("archived")),
                  },
                )
              }
            >
              {post.isArchived ? t("restorePost") : t("archivePost")}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onSelect={() => setReportOpen(true)}
              className="text-ig-danger focus:text-ig-danger"
            >
              {t("reportPost")}
            </DropdownMenuItem>
          )}

          {isMine ? (
            <DropdownMenuItem
              onSelect={() => setConfirmOpen(true)}
              className="text-ig-danger focus:text-ig-danger"
            >
              {t("deletePost")}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        title={t("reportPost")}
        description={t("reportPostDescription")}
        confirmLabel={t("reportPost")}
        onConfirm={() =>
          report.mutate(
            // `reason` is free text (3–500), not an enum — send a real sentence.
            { reason: t("reportReasonDefault") },
            { onSuccess: () => toast.success(t("reportSent")) },
          )
        }
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t("deletePost")}
        description={t("deletePostConfirm")}
        confirmLabel={tCommon("delete")}
        onConfirm={() => remove.mutate(post.id, { onSuccess: () => onDeleted?.() })}
      />
    </div>
  );
}
