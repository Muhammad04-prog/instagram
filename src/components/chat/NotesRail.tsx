"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { NoteBubble } from "@/components/chat/NoteBubble";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotes } from "@/hooks/useNotes";
import { useMyProfile } from "@/hooks/useProfile";
import { useNoteComposerStore } from "@/store/note-composer.store";

/**
 * The note bubbles above the chat list.
 *
 * Notes are new: ≤60 characters, optional track, expire after 24h. Mine is
 * pinned first — tapping it composes or edits, exactly as IG does.
 */
export function NotesRail() {
  const t = useTranslations("note");
  const { data: profile } = useMyProfile();
  const { data, isPending } = useNotes();
  const openComposer = useNoteComposerStore((s) => s.openComposer);

  const notes = data ?? [];
  const mine = notes.find((note) => note.isMine);
  const others = notes.filter((note) => !note.isMine);

  return (
    <div className="flex scrollbar-none gap-4 overflow-x-auto px-4 pt-2 pb-4">
      {/* My own bubble is itself a button — it opens who liked and replied —
            and a button inside a button is invalid HTML: the browser flattens
            it and the outer click wins. So the avatar is the button and the
            bubble is its sibling, both inside the same positioning context so
            the bubble still sits over the avatar. */}
      <div className="flex w-16 shrink-0 flex-col items-center gap-1">
        {/* Same order and inline flow as someone else's note below: the
              bubble anchors itself off this span, so it must sit beside the
              avatar, not on a line of its own. */}
        <span className="relative">
          {mine ? <NoteBubble note={mine} onWriteNew={() => openComposer(mine)} /> : null}

          <button type="button" onClick={() => openComposer(mine ?? null)}>
            {mine ? null : (
              <>
                <span className="bg-ig-button-secondary text-ig-text-secondary absolute -top-7 left-1/2 flex h-8 -translate-x-1/2 items-center rounded-full px-3 text-[11px] whitespace-nowrap">
                  {t("newNote")}
                </span>
                <span className="bg-ig-button-secondary absolute -top-1 left-2 size-2 rounded-full" />
              </>
            )}

            <UserAvatar src={profile?.avatarUrl} size={56} />

            {mine ? null : (
              <span className="bg-ig-primary border-ig-bg absolute right-0 bottom-0 flex size-5 items-center justify-center rounded-full border-2">
                <Plus className="size-3 text-white" />
              </span>
            )}
          </button>
        </span>

        <span className="text-ig-text w-full text-center text-xs leading-tight">
          {t("yourNote")}
        </span>
      </div>

      {isPending
        ? Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex w-16 shrink-0 flex-col items-center gap-1">
              <Skeleton className="size-14 rounded-full" />
              <Skeleton className="h-2 w-10" />
            </div>
          ))
        : others.map((note) => (
            <div key={note.id} className="flex w-16 shrink-0 flex-col items-center gap-1">
              <span className="relative">
                <NoteBubble note={note} />
                <UserAvatar
                  src={note.author.avatarUrl ?? null}
                  alt={note.author.userName}
                  size={56}
                />
              </span>
              <span className="text-ig-text w-full truncate text-center text-xs">
                {note.author.userName}
              </span>
            </div>
          ))}
    </div>
  );
}
