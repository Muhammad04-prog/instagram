"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useState } from "react";
import { DotsIcon } from "@/components/icons";
import { EditCaptionDialog } from "@/components/post/EditCaptionDialog";
import { PostInsightsDialog } from "@/components/post/PostInsightsDialog";
import { PostRemixesDialog } from "@/components/post/PostRemixesDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import {
  useArchivePost,
  useDeletePost,
  usePinPost,
  useReportPost,
  useSharePost,
  useUpdatePostPrivacy,
} from "@/hooks/usePosts";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { PostDto } from "@/types/post.types";

/**
 * The «...» menu (docs/screenshots/img13): everything a post's dropdown can
 * do, in one place, so `PostHeader` (feed) and `ReelCard` (reels) share the
 * exact same working handlers instead of one of them being a dead `<Link>`.
 */
export function PostOptionsMenu({
  post,
  onDeleted,
  triggerClassName,
}: {
  post: PostDto;
  onDeleted?: () => void;
  triggerClassName?: string;
}) {
  const t = useTranslations("post");
  const tCommon = useTranslations("common");
  const { user } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [remixesOpen, setRemixesOpen] = useState(false);
  const remove = useDeletePost();
  const archive = useArchivePost();
  const report = useReportPost(post.id);
  const share = useSharePost(post.id);
  const pin = usePinPost();
  const privacy = useUpdatePostPrivacy();

  const isMine = post.author.id === user?.id;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" aria-label={tCommon("more")} className={cn(triggerClassName)}>
            <DotsIcon className="size-6" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-ig-elevated w-max min-w-56">
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
            <DropdownMenuItem onSelect={() => setEditOpen(true)}>
              {t("editCaption")}
            </DropdownMenuItem>
          ) : null}

          {isMine ? (
            <DropdownMenuItem
              onSelect={() =>
                pin.mutate(post.id, {
                  onSuccess: (updated) =>
                    toast.success(
                      updated.pinnedAt ? t("pinnedToProfile") : t("unpinnedFromProfile"),
                    ),
                })
              }
              disabled={pin.isPending}
            >
              {post.pinnedAt ? t("unpinPost") : t("pinPost")}
            </DropdownMenuItem>
          ) : null}

          {isMine ? (
            <DropdownMenuItem
              onSelect={() =>
                privacy.mutate(
                  { postId: post.id, hideLikeCount: !post.hideLikeCount },
                  {
                    onSuccess: () =>
                      toast.success(
                        post.hideLikeCount ? t("likeCountShown") : t("likeCountHidden"),
                      ),
                  },
                )
              }
              disabled={privacy.isPending}
            >
              {post.hideLikeCount ? t("showLikeCount") : t("hideLikeCount")}
            </DropdownMenuItem>
          ) : null}

          {isMine ? (
            <DropdownMenuItem
              onSelect={() =>
                privacy.mutate(
                  { postId: post.id, commentsDisabled: !post.commentsDisabled },
                  {
                    onSuccess: () =>
                      toast.success(post.commentsDisabled ? t("commentingOn") : t("commentingOff")),
                  },
                )
              }
              disabled={privacy.isPending}
            >
              {post.commentsDisabled ? t("turnOnCommenting") : t("turnOffCommenting")}
            </DropdownMenuItem>
          ) : null}

          {isMine ? (
            <DropdownMenuItem onSelect={() => setInsightsOpen(true)}>
              {t("viewInsights")}
            </DropdownMenuItem>
          ) : null}

          {post.isReel ? (
            <DropdownMenuItem onSelect={() => setRemixesOpen(true)}>
              {t("viewRemixes")}
            </DropdownMenuItem>
          ) : null}

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

      <EditCaptionDialog post={post} open={editOpen} onOpenChange={setEditOpen} />
      {isMine ? (
        <PostInsightsDialog postId={post.id} open={insightsOpen} onOpenChange={setInsightsOpen} />
      ) : null}
      {post.isReel ? (
        <PostRemixesDialog postId={post.id} open={remixesOpen} onOpenChange={setRemixesOpen} />
      ) : null}

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
    </>
  );
}
