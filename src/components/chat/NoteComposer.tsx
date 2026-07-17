"use client";

import { ChevronDown, SmilePlus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { MusicPicker } from "@/components/post/MusicPicker";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCreateNote, useUpdateNote } from "@/hooks/useNotes";
import { useMyProfile } from "@/hooks/useProfile";
import { DEFAULT_NOTE_COLOR, NOTE_COLORS, noteTextColor } from "@/lib/note-colors";
import { cn } from "@/lib/utils";
import type { MusicDto, NoteDto } from "@/types/api.types";

/** The API caps a note at 60 characters. */
const NOTE_MAX = 60;

type Audience = "FOLLOWERS" | "CLOSE_FRIENDS";

/**
 * Write my note — a full-screen takeover, not a small card (real IG's own
 * composer, not the tabbed sheet from an earlier attempt at this).
 *
 * Editing and deleting a *live* note happen from the compact popover
 * (NoteInsightsSheet) instead — this screen only ever creates or replaces.
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
  const { data: profile } = useMyProfile();

  const [text, setText] = useState(note?.text ?? "");
  const [color, setColor] = useState(note?.bgColor ?? DEFAULT_NOTE_COLOR);
  const [music, setMusic] = useState<MusicDto | null>(null);
  const [audience, setAudience] = useState<Audience>(note?.audience ?? "FOLLOWERS");
  const [extrasOpen, setExtrasOpen] = useState(false);

  const create = useCreateNote();
  const update = useUpdateNote();
  const pending = create.isPending || update.isPending;
  const fg = noteTextColor(color);

  const submit = () => {
    const value = text.trim();
    if (!value) return;

    const dto = {
      text: value,
      bgColor: color,
      audience,
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
        className="bg-ig-bg top-0 left-0 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none p-0 sm:max-w-none"
      >
        <DialogTitle className="sr-only">{note ? t("editNote") : t("newNote")}</DialogTitle>

        <div className="flex shrink-0 items-center px-4 py-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label={tCommon("close")}
            className="text-ig-text shrink-0"
          >
            <X className="size-6" />
          </button>
          <span className="text-ig-text ml-4 truncate text-base font-semibold">
            {note ? t("editNote") : t("newNote")}
          </span>
          <button
            type="button"
            onClick={submit}
            disabled={!text.trim() || pending}
            className="text-ig-primary ml-auto shrink-0 text-sm font-semibold disabled:opacity-40"
          >
            {t("publish")}
          </button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-4 overflow-y-auto px-4">
          <span className="relative inline-flex">
            <span
              style={{ backgroundColor: color, color: fg }}
              className="absolute -top-11 left-1/2 flex h-9 max-w-[260px] min-w-[64px] -translate-x-1/2 items-center rounded-2xl px-4"
            >
              <input
                value={text}
                onChange={(event) => setText(event.target.value.slice(0, NOTE_MAX))}
                autoFocus
                placeholder={t("placeholder")}
                aria-label={t("placeholder")}
                size={Math.max(text.length, 14)}
                style={{ color: fg }}
                className="min-w-0 bg-transparent text-center text-sm outline-none placeholder:opacity-70"
              />
            </span>
            <span
              style={{ backgroundColor: color }}
              className="absolute -top-2 left-1/2 size-2.5 -translate-x-1/2 rounded-full"
            />

            <UserAvatar src={profile?.avatarUrl} size={176} priority />
          </span>

          <button
            type="button"
            onClick={() => setExtrasOpen((value) => !value)}
            aria-label={t("moreOptions")}
            aria-expanded={extrasOpen}
            className="bg-ig-button-secondary text-ig-text flex size-9 items-center justify-center rounded-full"
          >
            <SmilePlus className="size-5" />
          </button>

          {extrasOpen ? (
            <div className="bg-ig-elevated border-ig-separator w-full max-w-[280px] rounded-2xl border p-4">
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

              <div className="mt-3">
                <MusicPicker value={music} onChange={setMusic} />
              </div>
            </div>
          ) : null}

          <p className="text-ig-text-secondary text-xs">
            {text.length}/{NOTE_MAX}
          </p>
        </div>

        <div className="border-ig-separator flex shrink-0 items-center justify-center border-t px-4 py-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="text-ig-text-secondary flex items-center gap-1.5 text-sm">
              <span>
                {t("audienceLabel")}:{" "}
                <span className="text-ig-text font-semibold">
                  {audience === "FOLLOWERS" ? t("audienceFollowers") : t("audienceCloseFriends")}
                </span>
              </span>
              <ChevronDown className="size-4 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem onSelect={() => setAudience("FOLLOWERS")}>
                {t("audienceFollowers")}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setAudience("CLOSE_FRIENDS")}>
                {t("audienceCloseFriends")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </DialogContent>
    </Dialog>
  );
}
