"use client";

import { MoreHorizontal, SmilePlus } from "lucide-react";
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
import { useDeleteMessage, useToggleMessageReaction } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { themeBubble } from "@/lib/chat-themes";
import { cn, getImageUrl } from "@/lib/utils";
import { isAttachment, type MessageDto } from "@/types/chat.types";

/**
 * Mine: blue, right. Theirs: grey, left with avatar (img21).
 *
 * `type` says what the attachment is, so the renderer no longer sniffs the file
 * extension the way it had to on softclub.
 */
/** IG's reaction row — one tap adds, tapping your own emoji takes it back. */
const QUICK = ["❤️", "😂", "😮", "😢", "😡", "👍"];

export function MessageBubble({
  message,
  mine,
  peerImage,
  theme,
}: {
  message: MessageDto;
  mine: boolean;
  peerImage: string | null;
  /** Chat theme name — colours my own bubbles. */
  theme?: string | null;
}) {
  const t = useTranslations("chat");
  const { user } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const deleteMessage = useDeleteMessage(message.chatId);
  const react = useToggleMessageReaction(message.chatId);

  // One reaction per person: mine is the one I can take back.
  const myReaction = message.reactions.find((r) => r.userId === user?.id)?.emoji ?? null;

  // Negative id = optimistic, not yet acknowledged by the server.
  const pending = message.id < 0;
  const fileUrl = message.mediaUrl ? getImageUrl(message.mediaUrl) : null;

  return (
    <div className={cn("group flex items-end gap-2", mine ? "justify-end" : "justify-start")}>
      {!mine ? <UserAvatar src={peerImage} size={28} /> : null}

      {/* Own messages only — and the server agrees now: its OwnerGuard rejects
          deleting someone else's. Softclub enforced nothing (bug #15). */}
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
          "relative max-w-[65%] rounded-[22px]",
          message.text ? "px-4 py-2" : "p-1",
          mine ? themeBubble(theme) : "bg-ig-button-secondary text-ig-text",
          pending && "opacity-60",
        )}
      >
        {fileUrl && isAttachment(message) ? (
          message.type === "IMAGE" ? (
            <Image
              src={fileUrl}
              alt={message.text ?? ""}
              width={240}
              height={240}
              className="mb-1 max-h-80 w-60 rounded-2xl object-cover"
              unoptimized
            />
          ) : message.type === "VIDEO" ? (
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

        {message.text ? (
          <p className="text-sm break-words whitespace-pre-wrap">{message.text}</p>
        ) : null}

        {/* Reactions hang off the bubble's corner, as in IG. */}
        {message.reactions.length > 0 ? (
          <span
            className={cn(
              "bg-ig-elevated border-ig-bg absolute -bottom-2 flex items-center gap-0.5 rounded-full border-2 px-1 text-xs",
              mine ? "right-2" : "left-2",
            )}
          >
            {[...new Set(message.reactions.map((r) => r.emoji))].map((emoji) => (
              <span key={emoji}>{emoji}</span>
            ))}
            {message.reactions.length > 1 ? (
              <span className="text-ig-text-secondary">{message.reactions.length}</span>
            ) : null}
          </span>
        ) : null}
      </div>

      {/* Reaction picker, on hover like IG's desktop web. */}
      {pending ? null : (
        <div className="relative self-center">
          <button
            type="button"
            aria-label={t("react")}
            onClick={() => setPickerOpen((value) => !value)}
            className="text-ig-text-secondary opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
          >
            <SmilePlus className="size-4" />
          </button>

          {pickerOpen ? (
            <ul className="bg-ig-elevated border-ig-separator absolute bottom-6 z-10 flex gap-1 rounded-full border px-2 py-1 shadow-lg">
              {QUICK.map((emoji) => (
                <li key={emoji}>
                  <button
                    type="button"
                    aria-label={emoji}
                    onClick={() => {
                      react.mutate({
                        messageId: message.id,
                        // Same emoji again = take it back.
                        emoji: myReaction === emoji ? null : emoji,
                      });
                      setPickerOpen(false);
                    }}
                    className={cn(
                      "text-lg transition-transform hover:scale-125",
                      myReaction === emoji && "scale-110",
                    )}
                  >
                    {emoji}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t("deleteMessage")}
        description={t("deleteMessageConfirm")}
        confirmLabel={t("deleteMessage")}
        onConfirm={() => deleteMessage.mutate(message.id)}
      />
    </div>
  );
}
