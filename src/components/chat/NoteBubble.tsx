"use client";

import { Music, SmilePlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { HeartIcon } from "@/components/icons";
import { NoteOwnCard } from "@/components/chat/NoteInsightsSheet";
import { useLikeNote, useReplyToNote } from "@/hooks/useNotes";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { noteTextColor } from "@/lib/note-colors";
import { cn } from "@/lib/utils";
import type { NoteDto } from "@/types/api.types";

/** Real IG's "most popular" quick-react row — one tap sends it as a reply. */
const QUICK_EMOJI = ["😂", "😮", "😍", "😢", "👏", "🔥", "🎉", "💯", "❤️", "🥰", "😘", "🤩"];

/**
 * The thought bubble sitting on an avatar.
 *
 * Someone else's opens a small popover: like it, or reply — and a **reply is a
 * message in their chat**, not a comment, so it takes you there.
 *
 * Mine opens who liked and who replied — the two endpoints only its author may
 * read. (Tapping the avatar still opens the composer.)
 */
export function NoteBubble({ note, onWriteNew }: { note: NoteDto; onWriteNew?: () => void }) {
  const t = useTranslations("note");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [text, setText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);

  const like = useLikeNote();
  const reply = useReplyToNote();

  const sendReply = (value: string) => {
    reply.mutate(
      { id: note.id, text: value },
      {
        onSuccess: (result) => {
          toast.success(t("replySent", { userName: note.author.userName }));
          setOpen(false);
          setEmojiOpen(false);
          setText("");
          // The reply became a message — go where it landed.
          router.push(ROUTES.chatById(result.chatId));
        },
      },
    );
  };

  const color = note.bgColor ?? undefined;
  const fg = noteTextColor(note.bgColor);

  // Deliberately not wrapped in a positioned element of its own. It used to be,
  // and that wrapper was a zero-width inline span sitting beside the avatar — so
  // `left-1/2` resolved to the span's left edge and every bubble in the rail sat
  // 28px (half an avatar) to the left of the face it belongs to. The caller
  // already provides a relative span around the avatar; anchor to that.
  return (
    <>
      <button
        type="button"
        onClick={() => (note.isMine ? setInsightsOpen(true) : setOpen((value) => !value))}
        aria-expanded={note.isMine ? undefined : open}
        style={{ backgroundColor: color, color: fg }}
        className="absolute -top-7 left-1/2 z-10 flex h-8 max-w-[120px] -translate-x-1/2 items-center gap-1 rounded-full px-3 text-[11px]"
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
              if (value) sendReply(value);
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => setEmojiOpen((value) => !value)}
              aria-label={t("moreOptions")}
              aria-expanded={emojiOpen}
              className="text-ig-text-secondary shrink-0"
            >
              <SmilePlus className="size-4" />
            </button>
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

          {emojiOpen ? (
            <ul className="mt-2 grid grid-cols-6 gap-1">
              {QUICK_EMOJI.map((emoji) => (
                <li key={emoji}>
                  <button
                    type="button"
                    onClick={() => sendReply(emoji)}
                    className="hover:bg-ig-button-secondary flex size-7 items-center justify-center rounded-md text-base"
                  >
                    {emoji}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {note.isMine ? (
        <NoteOwnCard
          note={note}
          open={insightsOpen}
          onOpenChange={setInsightsOpen}
          onWriteNew={() => onWriteNew?.()}
        />
      ) : null}
    </>
  );
}
