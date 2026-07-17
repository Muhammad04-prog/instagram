"use client";

import { ImageIcon, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { useSendMessage } from "@/hooks/useChat";
import { useChatStore } from "@/store/chat.store";

/** Rounded composer bar (img21): attach on the right, Enter or "Send" to submit. */
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
    <form onSubmit={submit} className="px-6 pt-2 pb-6">
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
        <input
          value={draft}
          onChange={(event) => setDraft(chatId, event.target.value)}
          placeholder={t("typeMessage")}
          aria-label={t("typeMessage")}
          className="text-ig-text placeholder:text-ig-text-secondary flex-1 bg-transparent text-sm outline-none"
        />

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
          className="text-ig-text cursor-pointer"
        >
          <ImageIcon className="size-5" />
        </label>

        {canSend ? (
          <button type="submit" className="text-ig-primary text-sm font-semibold">
            {t("send")}
          </button>
        ) : null}
      </div>
    </form>
  );
}
