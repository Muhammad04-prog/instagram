"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { MusicPicker } from "@/components/post/MusicPicker";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useCreateNote, useDeleteNote, useUpdateNote } from "@/hooks/useNotes";
import { DEFAULT_NOTE_COLOR, NOTE_COLORS, noteTextColor } from "@/lib/note-colors";
import { cn } from "@/lib/utils";
import type { MusicDto, NoteDto } from "@/types/api.types";

/** The API caps a note at 60 characters. */
const NOTE_MAX = 60;

/**
 * Write / edit / delete my note.
 *
 * One note per person, so this is create *or* edit depending on whether one is
 * live. Notes expire after 24h on their own; the hint says so, because a thing
 * that disappears should never be a surprise.
 */
export function NoteComposer({
  note,
  open,
  onOpenChange,
}: {
  /** My live note, or null if I have none. */
  note: NoteDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("note");
  const tCommon = useTranslations("common");

  const [text, setText] = useState(note?.text ?? "");
  const [color, setColor] = useState(note?.bgColor ?? DEFAULT_NOTE_COLOR);
  const [music, setMusic] = useState<MusicDto | null>(null);

  const create = useCreateNote();
  const update = useUpdateNote();
  const remove = useDeleteNote();

  const pending = create.isPending || update.isPending || remove.isPending;

  const submit = () => {
    const value = text.trim();
    if (!value) return;

    // `audience` is new and optional on the wire (the server defaults it to
    // FOLLOWERS); we send it outright because there is no close-friends toggle
    // in this composer yet, and a silent default is worth naming.
    const dto = {
      text: value,
      bgColor: color,
      audience: "FOLLOWERS" as const,
      ...(music ? { musicId: music.id } : {}),
    };
    const done = {
      onSuccess: () => {
        toast.success(note ? t("noteUpdated") : t("noteShared"));
        onOpenChange(false);
      },
    };

    if (note) update.mutate({ id: note.id, dto }, done);
    else create.mutate(dto, done);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-ig-elevated w-[400px] gap-0 overflow-hidden rounded-xl p-0"
      >
        <div className="border-ig-separator flex items-center justify-between border-b px-4 py-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-ig-text text-sm"
          >
            {tCommon("cancel")}
          </button>
          <DialogTitle className="text-ig-text text-base font-semibold">
            {note ? t("editNote") : t("newNote")}
          </DialogTitle>
          <button
            type="button"
            onClick={submit}
            disabled={!text.trim() || pending}
            className="text-ig-primary text-sm font-semibold disabled:opacity-40"
          >
            {t("share")}
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div className="flex justify-center py-2">
            <span
              style={{ backgroundColor: color, color: noteTextColor(color) }}
              className="max-w-[220px] rounded-2xl px-4 py-2 text-center text-sm break-words"
            >
              {text || t("placeholder")}
            </span>
          </div>

          <div>
            <input
              value={text}
              onChange={(event) => setText(event.target.value.slice(0, NOTE_MAX))}
              autoFocus
              placeholder={t("placeholder")}
              aria-label={t("placeholder")}
              className="border-ig-border text-ig-text placeholder:text-ig-text-secondary h-11 w-full rounded-lg border bg-transparent px-3 text-sm outline-none"
            />
            <p className="text-ig-text-secondary mt-1 text-right text-xs">
              {text.length}/{NOTE_MAX}
            </p>
          </div>

          <ul className="flex justify-center gap-3">
            {NOTE_COLORS.map((swatch) => (
              <li key={swatch}>
                <button
                  type="button"
                  aria-label={swatch}
                  aria-pressed={color === swatch}
                  onClick={() => setColor(swatch)}
                  style={{ backgroundColor: swatch }}
                  className={cn(
                    "size-7 rounded-full",
                    color === swatch && "ring-ig-text ring-2 ring-offset-2",
                  )}
                />
              </li>
            ))}
          </ul>

          <MusicPicker value={music} onChange={setMusic} />

          <p className="text-ig-text-secondary text-center text-xs">{t("expiryHint")}</p>

          {note ? (
            <button
              type="button"
              onClick={() =>
                remove.mutate(note.id, {
                  onSuccess: () => {
                    toast.success(t("noteDeleted"));
                    onOpenChange(false);
                  },
                })
              }
              disabled={pending}
              className="text-ig-danger w-full py-2 text-sm font-semibold disabled:opacity-50"
            >
              {t("deleteNote")}
            </button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
