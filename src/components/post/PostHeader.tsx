"use client";

import { useFormatter, useTranslations } from "next-intl";
import { PostOptionsMenu } from "@/components/post/PostOptionsMenu";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { UserNameWithBadge } from "@/components/shared/VerifiedBadge";
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
  const format = useFormatter();

  return (
    <div className={cn("flex items-center gap-3 py-3", className)}>
      <Link href={ROUTES.profile(post.author.id)}>
        <UserAvatar src={post.author.avatarUrl} alt={post.author.userName ?? ""} size={32} />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 text-sm">
          <Link
            href={ROUTES.profile(post.author.id)}
            className="text-ig-text min-w-0 font-semibold hover:opacity-60"
          >
            <UserNameWithBadge
              userName={post.author.userName}
              isVerified={post.author.isVerified}
            />
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

        {/* Accepted co-authors — the post shows on their profile too. */}
        {post.collaborators.length > 0 ? (
          <p className="text-ig-text-secondary truncate text-xs">
            {t("withCollaborators", {
              names: post.collaborators.map((user) => user.userName).join(", "),
            })}
          </p>
        ) : null}
      </div>

      <PostOptionsMenu post={post} onDeleted={onDeleted} triggerClassName="text-ig-text" />
    </div>
  );
}
