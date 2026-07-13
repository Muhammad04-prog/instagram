"use client";

import { MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { UserAvatar } from "@/components/shared/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteMessage } from "@/hooks/useChat";
import { cn, getImageUrl } from "@/lib/utils";
import type { Message } from "@/types/chat.types";

const IMAGE_RE = /\.(png|jpe?g|gif|webp|avif)$/i;
const VIDEO_RE = /\.(mp4|webm|mov)$/i;

/** Mine: blue, right. Theirs: grey, left with avatar (img21). */
export function MessageBubble({
  message,
  mine,
  peerImage,
}: {
  message: Message;
  mine: boolean;
  peerImage: string | null;
}) {
  const t = useTranslations("chat");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteMessage = useDeleteMessage(message.chatId);

  // Negative id = optimistic, not yet acknowledged by the server.
  const pending = message.messageId < 0;
  const fileUrl = message.file ? getImageUrl(message.file) : null;

  return (
    <div className={cn("group flex items-end gap-2", mine ? "justify-end" : "justify-start")}>
      {!mine ? <UserAvatar src={peerImage} size={28} /> : null}

      {/* The "…" menu is only rendered for my own messages. The server does NOT
          enforce this — it will delete anyone's message (BACKEND_BUGS #15). */}
      {mine && !pending ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={t("messageOptions")}
              className="text-ig-text-secondary mb-2 opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <MoreHorizontal className="size-4" />
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
              {t("deleteMessage")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}

      <div
        className={cn(
          "max-w-[65%] overflow-hidden rounded-[22px]",
          message.messageText ? "px-4 py-2" : "p-1",
          mine ? "bg-ig-primary text-white" : "bg-ig-button-secondary text-ig-text",
          pending && "opacity-60",
        )}
      >
        {fileUrl ? (
          IMAGE_RE.test(message.file ?? "") ? (
            <Image
              src={fileUrl}
              alt={message.messageText ?? ""}
              width={240}
              height={240}
              className="mb-1 max-h-80 w-60 rounded-2xl object-cover"
              unoptimized
            />
          ) : VIDEO_RE.test(message.file ?? "") ? (
            <video src={fileUrl} controls className="mb-1 w-60 rounded-2xl" />
          ) : (
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="block px-3 py-1 text-sm underline"
            >
              {t("attachment")}
            </a>
          )
        ) : null}

        {message.messageText ? (
          <p className="text-sm break-words whitespace-pre-wrap">{message.messageText}</p>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t("deleteMessage")}
        description={t("deleteMessageConfirm")}
        confirmLabel={t("deleteMessage")}
        onConfirm={() => deleteMessage.mutate(message.messageId)}
      />
    </div>
  );
}
