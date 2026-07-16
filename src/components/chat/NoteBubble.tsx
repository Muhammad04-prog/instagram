"use client";

import { Music } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { HeartIcon } from "@/components/icons";
import { useLikeNote, useReplyToNote } from "@/hooks/useNotes";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { noteTextColor } from "@/lib/note-colors";
import { cn } from "@/lib/utils";
import type { NoteDto } from "@/types/api.types";

/**
 * The thought bubble sitting on an avatar.
 *
 * Someone else's opens a small popover: like it, or reply — and a **reply is a
 * message in their chat**, not a comment, so it takes you there.
 *
 * Mine is display-only here; tapping the avatar opens the composer instead.
 */
export function NoteBubble({ note }: { note: NoteDto }) {
  const t = useTranslations("note");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const like = useLikeNote();
  const reply = useReplyToNote();

  const color = note.bgColor ?? undefined;
  const fg = noteTextColor(note.bgColor);

  return (
    <span className="relative">
      <button
        type="button"
        onClick={() => !note.isMine && setOpen((value) => !value)}
        aria-expanded={note.isMine ? undefined : open}
        style={{ backgroundColor: color, color: fg }}
        className="absolute -top-7 left-1/2 flex h-8 max-w-[120px] -translate-x-1/2 items-center gap-1 rounded-full px-3 text-[11px]"
      >
        {note.music ? <Music className="size-3 shrink-0" /> : null}
        <span className="truncate">{note.text}</span>
      </button>

      {/* The little tail that makes it a thought bubble rather than a label. */}
      <span
        style={{ backgroundColor: color }}
        className="absolute -top-1 left-2 size-2 rounded-full"
      />

      {open ? (
        <div className="bg-ig-elevated border-ig-separator absolute top-9 left-1/2 z-20 w-56 -translate-x-1/2 rounded-xl border p-3 shadow-lg">
          <p className="text-ig-text mb-2 text-sm break-words">{note.text}</p>

          {note.music ? (
            <p className="text-ig-text-secondary mb-2 flex items-center gap-1 truncate text-xs">
              <Music className="size-3 shrink-0" />
              {note.music.title} · {note.music.artist}
            </p>
          ) : null}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              const value = text.trim();
              if (!value) return;
              reply.mutate(
                { id: note.id, text: value },
                {
                  onSuccess: (result) => {
                    toast.success(t("replySent", { userName: note.author.userName }));
                    setOpen(false);
                    setText("");
                    // The reply became a message — go where it landed.
                    router.push(ROUTES.chatById(result.chatId));
                  },
                },
              );
            }}
            className="flex items-center gap-2"
          >
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={t("replyPlaceholder")}
              aria-label={t("replyPlaceholder")}
              className="border-ig-separator text-ig-text placeholder:text-ig-text-secondary min-w-0 flex-1 border-b bg-transparent pb-1 text-xs outline-none"
            />
            <button
              type="button"
              onClick={() => like.mutate(note.id)}
              aria-label={t("like")}
              aria-pressed={note.isLiked}
              className="shrink-0"
            >
              <HeartIcon
                filled={note.isLiked}
                className={cn("size-4", note.isLiked ? "text-ig-danger" : "text-ig-text")}
              />
            </button>
          </form>
        </div>
      ) : null}
    </span>
  );
}
