"use client";

import { MoreHorizontal } from "lucide-react";
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
import { useChatMessages, useDeleteChat } from "@/hooks/useChat";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Chat, ChatPeer } from "@/types/chat.types";

/**
 * `get-chats` carries no last message and no timestamp, so the preview line is
 * read from the chat's own message list (same cache entry the window uses — the
 * row is not polling, it just reuses whatever is cached / fetches once).
 */
export function ChatListItem({
  chat,
  peer,
  active,
  myUserId,
}: {
  chat: Chat;
  peer: ChatPeer;
  active: boolean;
  myUserId: string;
}) {
  const t = useTranslations("chat");
  const format = useFormatter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteChat = useDeleteChat();

  const { data: messages } = useChatMessages(chat.chatId, false);
  const last = messages?.[0];

  const preview = last
    ? last.messageText
      ? last.messageText
      : last.file
        ? t("sentAttachment", { user: last.userId === myUserId ? t("you") : peer.userName })
        : ""
    : "";

  return (
    <li className={cn("group relative", active && "bg-ig-button-secondary")}>
      <Link
        href={ROUTES.chatById(chat.chatId)}
        className="hover:bg-ig-bg-secondary flex items-center gap-3 px-6 py-2"
      >
        <UserAvatar src={peer.userImage} size={56} />
        <span className="min-w-0 flex-1">
          <span className="text-ig-text block truncate text-sm">{peer.userName}</span>
          <span className="text-ig-text-secondary block truncate text-xs">
            {preview}
            {last ? (
              <>
                {preview ? " · " : null}
                {format.relativeTime(new Date(last.sendMassageDate))}
              </>
            ) : null}
          </span>
        </span>
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
        onConfirm={() => deleteChat.mutate(chat.chatId)}
      />
    </li>
  );
}
