"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { UserNameWithBadge } from "@/components/shared/VerifiedBadge";
import { useCloseFriends, useToggleCloseFriend } from "@/hooks/useCloseFriends";
import { useDebounce } from "@/hooks/useDebounce";
import { useUsers } from "@/hooks/useUserSearch";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { SEARCH_DEBOUNCE_MS } from "@/lib/constants";
import { flattenPages } from "@/lib/cursor";

/**
 * The close-friends list: search to add, tap to remove.
 *
 * IG never tells anyone they were added or removed, so there is no confirm step
 * and no announcement — just the toggle, which is why it is optimistic.
 */
export function CloseFriendsManager() {
  const t = useTranslations("story");
  const [term, setTerm] = useState("");
  const debounced = useDebounce(term.trim(), SEARCH_DEBOUNCE_MS);

  const { data, isPending, isError, refetch } = useCloseFriends();
  const { data: results } = useUsers(debounced, debounced.length > 0);
  const toggle = useToggleCloseFriend();

  const friends = flattenPages(data);
  const chosen = new Set(friends.map((friend) => friend.id));

  // While searching, show candidates; otherwise the list itself.
  const rows = debounced
    ? (results ?? []).map((user) => ({ user, isFriend: chosen.has(user.id) }))
    : friends.map((friend) => ({ user: friend, isFriend: true }));

  if (isPending) return <Loader className="py-10" />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <div className="space-y-4">
      <input
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder={t("searchPeople")}
        aria-label={t("searchPeople")}
        className="bg-ig-button-secondary text-ig-text placeholder:text-ig-text-secondary h-10 w-full rounded-lg px-4 text-sm outline-none"
      />

      {rows.length === 0 ? (
        <EmptyState title={t("closeFriendsEmpty")} className="py-10" />
      ) : (
        <ul className="space-y-1">
          {rows.map(({ user, isFriend }) => (
            <li key={user.id} className="flex items-center gap-3 py-2">
              <Link href={ROUTES.profile(user.id)}>
                <UserAvatar src={user.avatarUrl ?? null} alt={user.userName} size={44} />
              </Link>

              <div className="min-w-0 flex-1">
                <Link href={ROUTES.profile(user.id)} className="text-ig-text text-sm font-semibold">
                  <UserNameWithBadge userName={user.userName} isVerified={user.isVerified} />
                </Link>
                <p className="text-ig-text-secondary truncate text-sm">{user.fullName}</p>
              </div>

              <button
                type="button"
                onClick={() => toggle.mutate({ userId: user.id, add: !isFriend })}
                disabled={toggle.isPending}
                className={
                  isFriend
                    ? "bg-ig-button-secondary text-ig-text hover:bg-ig-button-secondary-hover shrink-0 rounded-lg px-4 py-1.5 text-sm font-semibold disabled:opacity-50"
                    : "bg-ig-primary hover:bg-ig-primary-hover shrink-0 rounded-lg px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                }
              >
                {isFriend ? t("removeCloseFriend") : t("addCloseFriend")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
