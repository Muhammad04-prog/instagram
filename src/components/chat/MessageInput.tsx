"use client";

import { Heart, ImageIcon, Mic, SmilePlus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { useSendMessage } from "@/hooks/useChat";
import { useChatStore } from "@/store/chat.store";

/** Rounded composer bar (img21): emoji left, attach on the right, Enter or "Send" to submit. */
export function MessageInput({ chatId }: { chatId: number }) {
  const t = useTranslations("chat");
  const draft = useChatStore((s) => s.drafts[chatId] ?? "");
  const setDraft = useChatStore((s) => s.setDraft);
  const send = useSendMessage(chatId);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const text = draft.trim();
  // The server happily stores a message with neither text nor file
  // (BACKEND_BUGS #17), so the empty case is blocked here.
  const canSend = (text.length > 0 || file !== null) && !send.isPending;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSend) return;
    send.mutate({ text: text || undefined, file: file ?? undefined });
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <form onSubmit={submit} className="px-4 pt-2 pb-4">
      {file ? (
        <div className="text-ig-text-secondary mb-2 flex items-center gap-2 text-xs">
          <span className="truncate">{file.name}</span>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              if (fileRef.current) fileRef.current.value = "";
            }}
            aria-label={t("removeAttachment")}
          >
            <X className="size-4" />
          </button>
        </div>
      ) : null}

      <div className="border-ig-border flex items-center gap-3 rounded-full border px-4 py-2">
        <button
          type="button"
          aria-label={t("emoji")}
          className="text-ig-text-secondary shrink-0 transition-colors hover:opacity-70"
        >
          <SmilePlus className="size-6" />
        </button>

        <input
          value={draft}
          onChange={(event) => setDraft(chatId, event.target.value)}
          placeholder={t("typeMessage")}
          aria-label={t("typeMessage")}
          className="text-ig-text placeholder:text-ig-text-secondary flex-1 bg-transparent text-sm outline-none"
        />

        {canSend ? (
          <button type="submit" className="text-ig-primary shrink-0 text-sm font-semibold">
            {t("send")}
          </button>
        ) : (
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              aria-label={t("voiceMessage")}
              className="text-ig-text transition-colors hover:opacity-70"
            >
              <Mic className="size-6" />
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="hidden"
              id={`chat-file-${chatId}`}
            />
            <label
              htmlFor={`chat-file-${chatId}`}
              aria-label={t("attach")}
              className="text-ig-text cursor-pointer transition-colors hover:opacity-70"
            >
              <ImageIcon className="size-6" />
            </label>

            <button
              type="button"
              aria-label={t("like")}
              className="text-ig-text transition-colors hover:opacity-70"
            >
              <Heart className="size-6" />
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
