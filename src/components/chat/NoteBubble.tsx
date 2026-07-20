"use client";

import { Music, SmilePlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { HeartIcon } from "@/components/icons";
import { NoteOwnCard } from "@/components/chat/NoteInsightsSheet";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useLikeNote, useReactToNote, useReplyToNote } from "@/hooks/useNotes";
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

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioSrc = note.music?.streamUrl ?? note.music?.previewUrl ?? undefined;

  useEffect(() => {
    if (!open && !insightsOpen && audioRef.current) {
      audioRef.current.pause();
    }
  }, [open, insightsOpen]);

  const handleOpen = () => {
    if (note.isMine) {
      setInsightsOpen(true);
    } else {
      setOpen((value) => !value);
    }

    if (audioRef.current && audioSrc) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const like = useLikeNote();
  const reply = useReplyToNote();
  const react = useReactToNote();

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

  // Its own endpoint (`POST /notes/{id}/reaction`), not a text reply that
  // happens to be one emoji — real IG's quick-react row sends a reaction.
  const sendReaction = (emoji: string) => {
    react.mutate(
      { id: note.id, emoji },
      {
        onSuccess: (result) => {
          toast.success(t("replySent", { userName: note.author.userName }));
          setOpen(false);
          setEmojiOpen(false);
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
        onClick={handleOpen}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[340px] gap-0 rounded-3xl border-none bg-[#262626] p-6 text-center text-white">
          <DialogTitle className="sr-only">{t("replyPlaceholder")}</DialogTitle>

          <div className="mt-6 flex flex-col items-center">
            <span className="relative mb-4">
              <div
                style={{ backgroundColor: color || "#363636", color: fg || "#fff" }}
                className="absolute -top-16 left-1/2 z-10 flex min-h-[48px] max-w-[240px] min-w-[100px] -translate-x-1/2 flex-col items-center justify-center rounded-3xl px-4 py-3 text-sm font-semibold shadow-md"
              >
                {note.text ? (
                  <span className="text-center text-base break-words whitespace-pre-wrap">
                    {note.text}
                  </span>
                ) : note.music ? (
                  <div className="flex flex-col items-center justify-center leading-tight">
                    <span className="flex items-center gap-1.5 text-sm font-semibold">
                      <Music className="size-3.5 shrink-0" /> {note.music.title}
                    </span>
                    <span className="mt-0.5 text-xs opacity-75">{note.music.artist}</span>
                  </div>
                ) : null}
              </div>
              <span
                style={{ backgroundColor: color || "#363636" }}
                className="absolute -top-2 left-1/2 z-10 size-3 -translate-x-[20px] rounded-full shadow-sm"
              />
              <span
                style={{ backgroundColor: color || "#363636" }}
                className="absolute -top-5 left-1/2 z-10 size-2 -translate-x-[30px] rounded-full shadow-sm"
              />
              <UserAvatar src={note.author.avatarUrl} size={100} />
            </span>

            <span className="mt-2 text-lg font-semibold">{note.author.userName}</span>

            {note.music && note.text ? (
              <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-white/70">
                <Music className="size-3.5 shrink-0" />
                <span className="truncate">
                  {note.music.title} · {note.music.artist}
                </span>
              </p>
            ) : null}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              const value = text.trim();
              if (value) sendReply(value);
            }}
            className="mt-6"
          >
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-3">
              <input
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder={t("replyPlaceholder")}
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/50"
              />
              <button
                type="button"
                onClick={() => like.mutate(note.id)}
                className="mr-2 shrink-0 text-white"
              >
                <HeartIcon
                  filled={note.isLiked}
                  className={cn("size-5", note.isLiked ? "text-ig-danger" : "text-white")}
                />
              </button>
              <button
                type="button"
                onClick={() => setEmojiOpen((value) => !value)}
                className="shrink-0 text-white"
              >
                <SmilePlus className="size-5" />
              </button>
            </div>

            {emojiOpen ? (
              <ul className="mt-4 grid grid-cols-6 gap-2">
                {QUICK_EMOJI.map((emoji) => (
                  <li key={emoji}>
                    <button
                      type="button"
                      onClick={() => sendReaction(emoji)}
                      className="flex size-10 items-center justify-center rounded-full text-xl hover:bg-white/10"
                    >
                      {emoji}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </form>
        </DialogContent>
      </Dialog>

      {note.isMine ? (
        <NoteOwnCard
          note={note}
          open={insightsOpen}
          onOpenChange={setInsightsOpen}
          onWriteNew={() => onWriteNew?.()}
        />
      ) : null}

      {audioSrc && <audio ref={audioRef} src={audioSrc} loop hidden />}
    </>
  );
}
