"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEditMessage } from "@/hooks/useChat";
import type { MessageDto } from "@/types/api.types";

/** The backend refuses an edit after this; the menu hides it, this is the belt. */
export const EDIT_WINDOW_MS = 15 * 60 * 1000;

export function canEditMessage(message: MessageDto): boolean {
  return (
    message.type === "TEXT" &&
    !message.isDeleted &&
    // Optimistic messages have no server id to edit yet.
    message.id > 0 &&
    Date.now() - new Date(message.sentAt).getTime() < EDIT_WINDOW_MS
  );
}

export function EditMessageDialog({
  message,
  open,
  onOpenChange,
}: {
  message: MessageDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("chat");
  const [text, setText] = useState(message.text ?? "");
  const edit = useEditMessage(message.chatId);

  const trimmed = text.trim();
  const unchanged = trimmed === (message.text ?? "").trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px]" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t("editMessage")}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!trimmed || unchanged) return;
            edit.mutate(
              { messageId: message.id, text: trimmed },
              { onSuccess: () => onOpenChange(false) },
            );
          }}
          className="space-y-4"
        >
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            aria-label={t("editMessage")}
            maxLength={1000}
            autoFocus
            className="bg-ig-button-secondary text-ig-text h-10 w-full rounded-lg px-3 text-sm outline-none"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-ig-text px-3 py-1.5 text-sm font-semibold"
            >
              {t("cancel")}
            </button>
            {/* Saving the same text would burn the edit for nothing. */}
            <button
              type="submit"
              disabled={!trimmed || unchanged || edit.isPending}
              className="bg-ig-primary hover:bg-ig-primary-hover rounded-lg px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {t("save")}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
