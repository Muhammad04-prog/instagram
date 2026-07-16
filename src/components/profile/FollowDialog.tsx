"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { SearchIcon } from "@/components/icons";
import { FollowButton } from "@/components/profile/FollowButton";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { UserNameWithBadge } from "@/components/shared/VerifiedBadge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useFollowers, useFollowing, useRemoveFollower } from "@/hooks/useFollow";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { FollowerDto } from "@/types/api.types";

export type FollowTab = "followers" | "following";

/**
 * Followers / Following modal with a local filter box. No reference screenshot
 * exists for it (docs/screenshots/INDEX.md §8), so it follows live IG: 400px
 * card, sticky header with the two tabs, scrollable list of rows.
 */
export function FollowDialog({
  userId,
  tab,
  onTabChange,
  open,
  onOpenChange,
}: {
  userId: string;
  tab: FollowTab;
  onTabChange: (tab: FollowTab) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("profile");
  const { user } = useAuth();
  const [query, setQuery] = useState("");

  const isMyProfile = userId === user?.id;

  const followers = useFollowers(userId, open && tab === "followers");
  const following = useFollowing(userId, open && tab === "following");
  const active = tab === "followers" ? followers : following;

  // The rows are flat users now — softclub wrapped each one in a `userShortInfo`
  // object (with a lowercase `fullname`) under a relation id.
  const rows = useMemo(() => {
    const list = active.data?.pages.flat() ?? [];
    const needle = query.trim().toLowerCase();
    if (!needle) return list;
    return list.filter(
      (row) =>
        row.userName.toLowerCase().includes(needle) || row.fullName.toLowerCase().includes(needle),
    );
  }, [active.data, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-ig-elevated flex h-[400px] w-[400px] flex-col gap-0 overflow-hidden rounded-xl p-0">
        <DialogTitle className="sr-only">
          {tab === "followers" ? t("followersTitle") : t("followingTitle")}
        </DialogTitle>

        <div className="border-ig-separator flex border-b">
          {(["followers", "following"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onTabChange(value)}
              className={cn(
                "flex-1 py-3 text-sm font-semibold",
                tab === value
                  ? "border-ig-text text-ig-text border-b-2"
                  : "text-ig-text-secondary border-b-2 border-transparent",
              )}
            >
              {value === "followers" ? t("followersTitle") : t("followingTitle")}
            </button>
          ))}
        </div>

        <div className="px-4 py-2">
          <label className="bg-ig-bg-secondary flex items-center gap-2 rounded-lg px-3 py-1.5">
            <SearchIcon className="text-ig-text-secondary size-4" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("searchPeople")}
              className="text-ig-text placeholder:text-ig-text-secondary w-full bg-transparent text-sm outline-none"
            />
          </label>
        </div>

        <div className="flex-1 scrollbar-none overflow-y-auto px-2 pb-2">
          {active.isPending ? (
            <RowSkeletons />
          ) : active.isError ? (
            <ErrorState onRetry={() => void active.refetch()} className="py-10" />
          ) : rows.length === 0 ? (
            <EmptyState title={t("noPeople")} className="py-10" />
          ) : (
            <ul>
              {rows.map((row) => (
                <PersonRow
                  key={row.id}
                  person={row}
                  profileUserId={userId}
                  // "Remove" only makes sense on MY OWN followers list.
                  canRemove={isMyProfile && tab === "followers"}
                  onNavigate={() => onOpenChange(false)}
                />
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PersonRow({
  person,
  profileUserId,
  canRemove,
  onNavigate,
}: {
  person: FollowerDto;
  profileUserId: string;
  canRemove: boolean;
  onNavigate: () => void;
}) {
  const t = useTranslations("profile");
  const { user } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const removeFollower = useRemoveFollower(profileUserId);
  const isMe = person.id === user?.id;

  return (
    <li className="flex items-center gap-3 px-2 py-2">
      <Link href={ROUTES.profile(person.id)} onClick={onNavigate}>
        <UserAvatar src={person.avatarUrl ?? null} size={44} alt={person.userName} />
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={ROUTES.profile(person.id)}
          onClick={onNavigate}
          className="text-ig-text block text-sm font-semibold"
        >
          <UserNameWithBadge userName={person.userName} isVerified={person.isVerified} />
        </Link>
        {person.fullName ? (
          <p className="text-ig-text-secondary truncate text-sm">{person.fullName}</p>
        ) : null}
      </div>

      {isMe ? null : canRemove ? (
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="bg-ig-button-secondary text-ig-text hover:bg-ig-button-secondary-hover shrink-0 rounded-lg px-4 py-1.5 text-xs font-semibold"
        >
          {t("removeFollower")}
        </button>
      ) : (
        // The row already knows whether I follow this person — hand it over so
        // the button does not spend a request per row finding out.
        <FollowButton
          userId={person.id}
          userName={person.userName}
          following={person.isFollowedByMe}
          variant="link"
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t("removeFollowerConfirm", { userName: person.userName })}
        description={t("removeFollowerDescription")}
        confirmLabel={t("removeFollower")}
        onConfirm={() => removeFollower.mutate(person.id)}
      />
    </li>
  );
}

function RowSkeletons() {
  return (
    <ul className="space-y-1 px-2 pt-2">
      {Array.from({ length: 6 }, (_, index) => (
        <li key={index} className="flex items-center gap-3 py-2">
          <Skeleton className="size-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </li>
      ))}
    </ul>
  );
}
