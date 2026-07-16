"use client";

import { BellOff, MoreHorizontal } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { UserAvatar } from "@/components/shared/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteChat } from "@/hooks/useChat";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { isAttachment, peerLabel, type ChatListItemDto } from "@/types/chat.types";

/**
 * One conversation row.
 *
 * Everything it draws comes from the list response — preview, time, unread
 * count, online dot. Phase 9's version had to fetch each chat's messages just to
 * show a preview line, and could show no unread badge at all: softclub had
 * neither `isRead` nor `unreadCount` anywhere in its API (bug #16).
 */
export function ChatListItem({
  chat,
  active,
  myUserId,
}: {
  chat: ChatListItemDto;
  active: boolean;
  myUserId: string;
}) {
  const t = useTranslations("chat");
  const format = useFormatter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteChat = useDeleteChat();

  const { lastMessage } = chat;
  const name = peerLabel(chat);
  const unread = chat.unreadCount > 0;

  const preview = !lastMessage
    ? ""
    : lastMessage.text
      ? lastMessage.text
      : isAttachment(lastMessage)
        ? t("sentAttachment", {
            user: lastMessage.senderId === myUserId ? t("you") : name,
          })
        : "";

  return (
    <li className={cn("group relative", active && "bg-ig-button-secondary")}>
      <Link
        href={ROUTES.chatById(chat.id)}
        className="hover:bg-ig-bg-secondary flex items-center gap-3 px-6 py-2"
      >
        <span className="relative shrink-0">
          <UserAvatar src={chat.peer.avatarUrl ?? null} alt={name} size={56} />
          {chat.isOnline ? (
            <span
              aria-label={t("online")}
              className="border-ig-bg absolute right-0 bottom-0 size-3.5 rounded-full border-2 bg-[color:var(--ig-success)]"
            />
          ) : null}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className={cn("text-ig-text block truncate text-sm", unread && "font-semibold")}>
              {name}
            </span>
            {chat.isMuted ? (
              <BellOff
                className="text-ig-text-secondary size-3.5 shrink-0"
                aria-label={t("muted")}
              />
            ) : null}
          </span>

          <span
            className={cn(
              "block truncate text-xs",
              unread ? "text-ig-text font-semibold" : "text-ig-text-secondary",
            )}
          >
            {preview}
            {chat.lastMessageAt ? (
              <>
                {preview ? " · " : null}
                {format.relativeTime(new Date(chat.lastMessageAt))}
              </>
            ) : null}
          </span>
        </span>

        {unread ? (
          <span className="bg-ig-primary ml-1 min-w-5 shrink-0 rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold text-white">
            {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
          </span>
        ) : null}
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={t("chatOptions")}
            className="text-ig-text-secondary absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <MoreHorizontal className="size-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            variant="destructive"
            onSelect={(event) => {
              event.preventDefault();
              setConfirmOpen(true);
            }}
          >
            {t("deleteChat")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t("deleteChat")}
        description={t("deleteChatConfirm")}
        confirmLabel={t("deleteChat")}
        onConfirm={() => deleteChat.mutate(chat.id)}
      />
    </li>
  );
}
