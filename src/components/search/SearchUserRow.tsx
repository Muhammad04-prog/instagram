"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { FollowButton } from "@/components/profile/FollowButton";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import type { User } from "@/types/user.types";

/**
 * One account in the search results or in "Recent".
 *
 * The follow button costs one `get-is-follow-user-profile-by-id` call per row —
 * the API has no bulk "am I following these users" endpoint — but the result is
 * cached per user, so repeating a search is free.
 */
export function SearchUserRow({
  user,
  onSelect,
  onRemove,
}: {
  user: User;
  onSelect: (user: User) => void;
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
        <UserAvatar src={user.avatar} size={44} />
        <span className="min-w-0 flex-1">
          <span className="text-ig-text block truncate text-sm font-semibold">{user.userName}</span>
          <span className="text-ig-text-secondary block truncate text-sm">
            {[user.fullName?.trim(), t("followers", { count: user.subscribersCount })]
              .filter(Boolean)
              .join(" · ")}
          </span>
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
