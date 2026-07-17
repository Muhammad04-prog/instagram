"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { FollowButton } from "@/components/profile/FollowButton";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { UserNameWithBadge } from "@/components/shared/VerifiedBadge";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import type { UserBriefDto } from "@/types/api.types";

/**
 * One account in the search results or in "Recent".
 *
 * The follow button costs one `is-following` call per row — there is no bulk
 * "am I following these users" endpoint — but the result is cached per user, so
 * repeating a search is free.
 */
export function SearchUserRow({
  user,
  onSelect,
  onRemove,
}: {
  user: UserBriefDto;
  onSelect: (user: UserBriefDto) => void;
  /** Renders the ✕ that deletes this row from "Recent". */
  onRemove?: () => void;
}) {
  const t = useTranslations("search");

  return (
    <li className="hover:bg-ig-bg-secondary flex items-center gap-3 px-6 py-2">
      <Link
        href={ROUTES.profile(user.id)}
        onClick={() => onSelect(user)}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <UserAvatar src={user.avatarUrl ?? null} size={44} />
        <span className="min-w-0 flex-1">
          <UserNameWithBadge
            userName={user.userName}
            isVerified={user.isVerified}
            className="text-ig-text block text-sm font-semibold"
          />
          {/* `UserBriefDto` has no follower count — the row shows the real name
              instead of a number the search endpoint never sends. */}
          <span className="text-ig-text-secondary block truncate text-sm">{user.fullName}</span>
        </span>
      </Link>

      <FollowButton userId={user.id} userName={user.userName} variant="link" />

      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={t("remove")}
          className="text-ig-text-secondary hover:text-ig-text shrink-0 p-1"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </li>
  );
}
