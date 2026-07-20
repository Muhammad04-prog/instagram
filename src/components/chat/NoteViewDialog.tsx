"use client";

import { Music } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { HeartIcon } from "@/components/icons";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useLikeNote, useNote, useReplyToNote } from "@/hooks/useNotes";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { noteTextColor } from "@/lib/note-colors";
import { cn } from "@/lib/utils";

/**
 * A note reached from somewhere other than its rail bubble — so far only a
 * `LIKE_NOTE`/reply notification (`NotificationDto.noteId`), which carries an
 * id but not the note itself. `GET /notes/{id}` is the only place this fits:
 * the note may already be gone from `/notes` (24h TTL) by the time it's tapped.
 */
export function NoteViewDialog({
  noteId,
  open,
  onOpenChange,
}: {
  noteId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("note");
  const { data: note, isPending, isError, refetch } = useNote(open ? noteId : null);
  const like = useLikeNote();
  const reply = useReplyToNote();
  const router = useRouter();
  const [text, setText] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-ig-elevated w-[360px] gap-0 overflow-hidden rounded-xl p-0">
        <div className="border-ig-separator border-b py-3 text-center">
          <DialogTitle className="text-ig-text text-base font-bold">{t("noteTitle")}</DialogTitle>
        </div>

        <div className="p-4">
          {isPending ? (
            <Loader className="py-10" />
          ) : isError || !note ? (
            <ErrorState onRetry={() => void refetch()} title={t("noteGone")} className="py-10" />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <UserAvatar src={note.author.avatarUrl ?? null} size={32} />
                <span className="text-ig-text text-sm font-semibold">{note.author.userName}</span>
              </div>

              <p
                style={{
                  backgroundColor: note.bgColor ?? undefined,
                  color: noteTextColor(note.bgColor),
                }}
                className="rounded-2xl px-4 py-3 text-sm break-words"
              >
                {note.text}
              </p>

              {note.music ? (
                <p className="text-ig-text-secondary flex items-center gap-1 text-xs">
                  <Music className="size-3.5 shrink-0" />
                  {note.music.title} · {note.music.artist}
                </p>
              ) : null}

              {note.isMine ? null : (
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
                          onOpenChange(false);
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
                    className="border-ig-separator text-ig-text placeholder:text-ig-text-secondary min-w-0 flex-1 border-b bg-transparent pb-1 text-sm outline-none"
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
                      className={cn("size-5", note.isLiked ? "text-ig-danger" : "text-ig-text")}
                    />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
