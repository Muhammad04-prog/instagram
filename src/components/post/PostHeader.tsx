"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { DotsIcon } from "@/components/icons";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StoryUploadDialog } from "@/components/story/StoryUploadDialog";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { UserNameWithBadge } from "@/components/shared/VerifiedBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useDeletePost } from "@/hooks/usePosts";
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
  const [shareStoryOpen, setShareStoryOpen] = useState(false);
  const remove = useDeletePost();

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
          {/* AddStories takes an optional PostId — that is IG's "share to story". */}
          <DropdownMenuItem onSelect={() => setShareStoryOpen(true)}>
            {t("shareToStory")}
          </DropdownMenuItem>
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

      <StoryUploadDialog open={shareStoryOpen} onOpenChange={setShareStoryOpen} postId={post.id} />

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
