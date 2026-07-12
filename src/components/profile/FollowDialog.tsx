"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { SearchIcon } from "@/components/icons";
import { FollowButton } from "@/components/profile/FollowButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useSubscribers, useSubscriptions } from "@/hooks/useFollow";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { FollowRelation } from "@/types/profile.types";

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
  const [query, setQuery] = useState("");

  const subscribers = useSubscribers(userId, open && tab === "followers");
  const subscriptions = useSubscriptions(userId, open && tab === "following");
  const active = tab === "followers" ? subscribers : subscriptions;

  const rows = useMemo(() => {
    const list = active.data ?? [];
    const needle = query.trim().toLowerCase();
    if (!needle) return list;
    return list.filter((row) => {
      const { userName, fullname } = row.userShortInfo;
      return (
        userName.toLowerCase().includes(needle) || (fullname ?? "").toLowerCase().includes(needle)
      );
    });
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
                <PersonRow key={row.id} relation={row} onNavigate={() => onOpenChange(false)} />
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PersonRow({ relation, onNavigate }: { relation: FollowRelation; onNavigate: () => void }) {
  const { user } = useAuth();
  const { userId: personId, userName, userPhoto, fullname } = relation.userShortInfo;
  const isMe = personId === user?.userId;

  return (
    <li className="flex items-center gap-3 px-2 py-2">
      <Link href={ROUTES.profile(personId)} onClick={onNavigate}>
        <UserAvatar src={userPhoto} size={44} alt={userName} />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={ROUTES.profile(personId)}
          onClick={onNavigate}
          className="text-ig-text block truncate text-sm font-semibold"
        >
          {userName}
        </Link>
        {fullname ? <p className="text-ig-text-secondary truncate text-sm">{fullname}</p> : null}
      </div>
      {isMe ? null : <FollowButton userId={personId} userName={userName} variant="link" />}
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
