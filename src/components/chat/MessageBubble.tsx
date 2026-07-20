"use client";

import { Check, Eye, MoreHorizontal, SmilePlus } from "lucide-react";
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
import { canEditMessage, EditMessageDialog } from "@/components/chat/EditMessageDialog";
import { SharedPostBubble } from "@/components/chat/SharedPostBubble";
import { VoiceMessagePlayer } from "@/components/chat/VoiceMessagePlayer";
import {
  useDeleteMessage,
  useOpenViewOnceMessage,
  useToggleMessageReaction,
} from "@/hooks/useChat";
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
  selecting,
  selected,
  onStartSelecting,
  onToggleSelected,
}: {
  message: MessageDto;
  mine: boolean;
  peerImage: string | null;
  /** Chat theme name — colours my own bubbles. */
  theme?: string | null;
  /** The whole window is in select-many mode. */
  selecting: boolean;
  selected: boolean;
  onStartSelecting: () => void;
  onToggleSelected: () => void;
}) {
  const t = useTranslations("chat");
  const { user } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const deleteMessage = useDeleteMessage(message.chatId);
  const react = useToggleMessageReaction(message.chatId);
  const openViewOnce = useOpenViewOnceMessage(message.chatId);
  // The "open" response hands back the real media exactly once — kept here,
  // not in the cache, since a later fetch is documented to hide it again for
  // everyone but the sender.
  const [revealedUrl, setRevealedUrl] = useState<string | null>(null);
  // Some media still points at the old, dead `instagram-api.softclub.tj` host
  // (pre-migration data) and 404s — this swaps the bubble to a text fallback
  // instead of a broken-image icon.
  const [mediaFailed, setMediaFailed] = useState(false);

  // One reaction per person: mine is the one I can take back.
  const myReaction = message.reactions.find((r) => r.userId === user?.id)?.emoji ?? null;

  // Negative id = optimistic, not yet acknowledged by the server.
  const pending = message.id < 0;
  // Optimistic rows have no server id, so they cannot be part of a bulk delete.
  const selectable = mine && !pending && !message.isDeleted;
  // A view-once attachment is only hidden from the *other* side — mine always shows.
  const viewOnceHidden = message.viewOnce && !mine && !revealedUrl;
  const fileUrl = viewOnceHidden
    ? null
    : (revealedUrl ?? (message.mediaUrl ? getImageUrl(message.mediaUrl) : null));

  return (
    <div
      className={cn(
        "group flex items-end gap-2",
        mine ? "justify-end" : "justify-start",
        // Only my own messages can go: the server refuses the rest, so they are
        // not selectable and must not look like they are.
        selecting && selectable && "cursor-pointer rounded-lg",
        selecting && selected && "bg-ig-elevated",
      )}
      onClick={selecting && selectable ? onToggleSelected : undefined}
    >
      {selecting ? (
        <span
          aria-hidden
          className={cn(
            "mb-2 flex size-5 shrink-0 items-center justify-center rounded-full border",
            selected ? "bg-ig-primary border-ig-primary" : "border-ig-border",
            !selectable && "invisible",
          )}
        >
          {selected ? <Check className="size-3 text-white" /> : null}
        </span>
      ) : null}

      {!mine ? <UserAvatar src={peerImage} size={28} /> : null}

      {/* Own messages only — and the server agrees now: its OwnerGuard rejects
          deleting someone else's. Softclub enforced nothing (bug #15). */}
      {mine && !pending && !selecting ? (
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
            {/* The backend allows an edit for 15 minutes and only on text.
                Offering it later would just produce a refusal. */}
            {canEditMessage(message) ? (
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  setEditOpen(true);
                }}
              >
                {t("editMessage")}
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                onStartSelecting();
              }}
            >
              {t("selectMessages")}
            </DropdownMenuItem>
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
        {message.type === "POST_SHARE" && message.sharedPostId ? (
          <SharedPostBubble postId={message.sharedPostId} />
        ) : viewOnceHidden ? (
          message.viewOnceOpened ? (
            <p className="text-ig-text-secondary flex items-center gap-1.5 px-2 py-1 text-sm italic">
              <Eye className="size-3.5" />
              {t("viewOnceOpened")}
            </p>
          ) : (
            <button
              type="button"
              onClick={() =>
                openViewOnce.mutate(message.id, {
                  onSuccess: (opened) =>
                    setRevealedUrl(opened.mediaUrl ? getImageUrl(opened.mediaUrl) : null),
                })
              }
              disabled={openViewOnce.isPending}
              className="flex items-center gap-1.5 px-2 py-1 text-sm font-semibold disabled:opacity-50"
            >
              <Eye className="size-3.5" />
              {t("viewOnceTapToView")}
            </button>
          )
        ) : fileUrl && isAttachment(message) ? (
          message.type === "IMAGE" ? (
            mediaFailed ? (
              <p className="text-ig-text-secondary px-2 py-1 text-sm italic">
                {t("attachmentUnavailable")}
              </p>
            ) : (
              <Image
                src={fileUrl}
                alt={message.text ?? ""}
                width={240}
                height={240}
                className="mb-1 max-h-80 w-60 rounded-2xl object-cover"
                unoptimized
                onError={() => setMediaFailed(true)}
              />
            )
          ) : message.type === "VIDEO" ? (
            mediaFailed ? (
              <p className="text-ig-text-secondary px-2 py-1 text-sm italic">
                {t("attachmentUnavailable")}
              </p>
            ) : (
              <video
                src={fileUrl}
                controls
                onError={() => setMediaFailed(true)}
                className="mb-1 w-60 rounded-2xl"
              />
            )
          ) : message.type === "AUDIO" ? (
            mediaFailed ? (
              <p className="text-ig-text-secondary px-2 py-1 text-sm italic">
                {t("attachmentUnavailable")}
              </p>
            ) : (
              <VoiceMessagePlayer
                src={fileUrl}
                seed={message.id}
                durationHint={message.duration}
                onError={() => setMediaFailed(true)}
              />
            )
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
          <p className="text-sm break-words whitespace-pre-wrap">
            {message.text}
            {/* IG marks an edited message. `editedAt` was arriving and being
                dropped, so a silent rewrite looked like the original. */}
            {message.editedAt ? (
              <span className="ml-1.5 align-baseline text-[10px] opacity-60">{t("edited")}</span>
            ) : null}
          </p>
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
      {pending || selecting ? null : (
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

      {editOpen ? (
        <EditMessageDialog message={message} open={editOpen} onOpenChange={setEditOpen} />
      ) : null}

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
