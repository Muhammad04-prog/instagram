"use client";

import { useFormatter, useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import { HeartIcon } from "@/components/icons";
import { NoteViewDialog } from "@/components/chat/NoteViewDialog";
import { FollowButton } from "@/components/profile/FollowButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { RowSkeleton } from "@/components/shared/RowSkeleton";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { UserNameWithBadge } from "@/components/shared/VerifiedBadge";
import { Separator } from "@/components/ui/separator";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/useNotifications";
import { Link, useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { cn, getImageUrl } from "@/lib/utils";
import { useUiStore } from "@/store/ui.store";
import type { NotificationDto } from "@/types/api.types";
import { flattenPages } from "@/lib/cursor";

/**
 * Slide-out notifications panel (docs/screenshots/img26–img28).
 *
 * Real data at last: softclub had no notification endpoint anywhere in its 57,
 * so Phase 3 built this panel knowing it could only ever show its empty state.
 *
 * The **server groups**: a row is the latest of its group, `othersCount` says how
 * many more people are behind it, and `groupIds` is what "read" applies to — so
 * the client never de-duplicates, it only phrases the row.
 */
export function NotificationsPanel() {
  const t = useTranslations("notifications");
  const panel = useUiStore((s) => s.panel);
  const open = panel === "notifications";

  // Don't fetch for a panel nobody opened.
  const { data, isPending, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useNotifications(open);
  const markAllRead = useMarkAllNotificationsRead();

  const items = flattenPages(data);
  const hasUnread = items.some((item) => !item.isRead);

  return (
    <aside
      aria-hidden={!open}
      className={cn(
        "border-ig-border bg-ig-bg left-sidebar-collapsed fixed inset-y-0 z-30 hidden w-[397px] flex-col rounded-r-2xl border-r transition-transform duration-200 md:flex",
        open ? "translate-x-0" : "pointer-events-none -translate-x-full",
      )}
    >
      <div className="flex items-center justify-between px-6 pt-6 pb-6">
        <h2 className="text-ig-text text-2xl font-semibold">{t("title")}</h2>
        {hasUnread ? (
          <button
            type="button"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="text-ig-primary text-sm font-semibold disabled:opacity-50"
          >
            {t("markAllRead")}
          </button>
        ) : null}
      </div>
      <Separator className="bg-ig-separator" />

      {open && isPending ? (
        <RowSkeleton />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} className="py-10" />
      ) : items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            icon={<HeartIcon className="text-ig-text size-10" />}
            title={t("empty")}
            description={t("emptyDescription")}
          />
        </div>
      ) : (
        <div className="flex-1 scrollbar-none overflow-y-auto py-2">
          <ul>
            {items.map((item) => (
              <NotificationRow key={item.id} item={item} />
            ))}
          </ul>

          {hasNextPage ? (
            <button
              type="button"
              onClick={() => void fetchNextPage()}
              disabled={isFetchingNextPage}
              className="text-ig-primary w-full py-3 text-sm font-semibold disabled:opacity-50"
            >
              {t("loadMore")}
            </button>
          ) : null}
        </div>
      )}
    </aside>
  );
}

/** Where a notification leads — decided by whichever id the server filled in. */
function targetOf(item: NotificationDto): string {
  if (item.postId) return ROUTES.post(item.postId);
  if (item.storyId) return ROUTES.stories(item.actor.id);
  return ROUTES.profile(item.actor.id);
}

function NotificationRow({ item }: { item: NotificationDto }) {
  const t = useTranslations("notifications");
  const format = useFormatter();
  const router = useRouter();
  const markRead = useMarkNotificationRead();
  const closePanel = useUiStore((s) => s.closePanel);
  const [noteViewOpen, setNoteViewOpen] = useState(false);

  const { actor } = item;

  // The server sends a ready `message`, but it is one language — and every
  // string in this app comes from messages/{en,ru,tg}.json. So the text is
  // rebuilt from `type` + `actor` + `othersCount`; `message` stays the fallback
  // for a type this build has not learned yet.
  const key = `type_${item.type}`;
  const text = t.has(key)
    ? t(key, { actor: actor.userName, others: item.othersCount })
    : item.message;

  const open = () => {
    if (!item.isRead) markRead.mutate(item.id);
    // A note has no page of its own — it's a rail bubble, and may already have
    // expired from that rail (24h TTL) — so this opens `GET /notes/{id}` in a
    // dialog instead of navigating anywhere.
    if (item.noteId) {
      setNoteViewOpen(true);
      return;
    }
    closePanel();
    router.push(targetOf(item));
  };

  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        onClick={open}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            open();
          }
        }}
        className={cn(
          "hover:bg-ig-bg-secondary flex cursor-pointer items-center gap-3 px-6 py-2",
          !item.isRead && "bg-ig-bg-secondary/60",
        )}
      >
        <Link href={ROUTES.profile(actor.id)} onClick={(event) => event.stopPropagation()}>
          <UserAvatar src={actor.avatarUrl ?? null} alt={actor.userName} size={44} />
        </Link>

        <p className="text-ig-text min-w-0 flex-1 text-sm">
          <span className="font-semibold">
            <UserNameWithBadge userName={actor.userName} isVerified={actor.isVerified} />
          </span>{" "}
          {stripActor(text, actor.userName)}{" "}
          <time
            dateTime={item.createdAt}
            className="text-ig-text-secondary"
            suppressHydrationWarning
          >
            {format.relativeTime(new Date(item.createdAt))}
          </time>
        </p>

        {/* A follow wants a button back; a post-related row gets its thumbnail
            (`postThumbUrl`, 17.07.2026) instead — never both at once. */}
        {item.type === "FOLLOW" || item.type === "FOLLOW_REQUEST" ? (
          <span onClick={(event) => event.stopPropagation()}>
            <FollowButton userId={actor.id} userName={actor.userName} variant="link" />
          </span>
        ) : item.postThumbUrl ? (
          <Image
            src={getImageUrl(item.postThumbUrl) ?? ""}
            alt=""
            width={44}
            height={44}
            className="size-11 shrink-0 rounded object-cover"
          />
        ) : null}

        {!item.isRead ? (
          <span aria-label={t("unread")} className="bg-ig-primary size-2 shrink-0 rounded-full" />
        ) : null}
      </div>

      {item.noteId ? (
        <NoteViewDialog noteId={item.noteId} open={noteViewOpen} onOpenChange={setNoteViewOpen} />
      ) : null}
    </li>
  );
}

/**
 * The name is rendered separately (with its verified badge), so drop the leading
 * "{actor}" from the phrase rather than printing the name twice.
 */
function stripActor(text: string, userName: string): string {
  return text.startsWith(userName) ? text.slice(userName.length).trimStart() : text;
}
