"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { DotsIcon } from "@/components/icons";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { UserAvatar } from "@/components/shared/UserAvatar";
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
import type { Post } from "@/types/post.types";

/** Avatar · username · relative time · «…» menu (docs/screenshots/img11, img13). */
export function PostHeader({
  post,
  onDeleted,
  className,
}: {
  post: Post;
  onDeleted?: () => void;
  className?: string;
}) {
  const t = useTranslations("post");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const { user } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const remove = useDeletePost();

  const isMine = post.userId === user?.userId;

  return (
    <div className={cn("flex items-center gap-3 py-3", className)}>
      <Link href={ROUTES.profile(post.userId)}>
        <UserAvatar src={post.userImage} alt={post.userName ?? ""} size={32} />
      </Link>

      <div className="flex min-w-0 flex-1 items-center gap-1 text-sm">
        <Link
          href={ROUTES.profile(post.userId)}
          className="text-ig-text truncate font-semibold hover:opacity-60"
        >
          {post.userName}
        </Link>
        <span className="text-ig-text-secondary">·</span>
        <time
          dateTime={post.datePublished}
          className="text-ig-text-secondary shrink-0"
          suppressHydrationWarning
        >
          {format.relativeTime(new Date(post.datePublished), new Date())}
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
            <Link href={ROUTES.post(post.postId)}>{t("goToPost")}</Link>
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

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t("deletePost")}
        description={t("deletePostConfirm")}
        confirmLabel={tCommon("delete")}
        onConfirm={() => remove.mutate(post.postId, { onSuccess: () => onDeleted?.() })}
      />
    </div>
  );
}
