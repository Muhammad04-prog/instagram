"use client";

import { Pencil, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import { CreateHighlightDialog } from "@/components/story/CreateHighlightDialog";
import { EditHighlightDialog } from "@/components/story/EditHighlightDialog";
import { HighlightViewer } from "@/components/story/HighlightViewer";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserHighlights } from "@/hooks/useHighlights";
import { getImageUrl } from "@/lib/utils";
import type { HighlightDto } from "@/types/api.types";

/**
 * The "Актуальное" circles under a profile's bio.
 *
 * A screen that could not exist before: softclub had no highlights, so the row
 * simply was not there. "New" only shows on my own profile, as on IG.
 */
export function HighlightCircles({ userId, isMe }: { userId: string; isMe: boolean }) {
  const t = useTranslations("story");
  const { data, isPending } = useUserHighlights(userId);
  const [createOpen, setCreateOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [editing, setEditing] = useState<HighlightDto | null>(null);

  const highlights = data ?? [];

  // Nothing to show and nothing to add: don't leave an empty strip behind.
  if (!isPending && highlights.length === 0 && !isMe) return null;

  return (
    <>
      <div className="border-ig-separator flex scrollbar-none gap-8 overflow-x-auto border-t py-4">
        {isMe ? (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex w-[84px] shrink-0 flex-col items-center gap-2"
          >
            <span className="border-ig-border text-ig-text flex size-[77px] items-center justify-center rounded-full border">
              <Plus className="size-7" />
            </span>
            <span className="text-ig-text w-full truncate text-center text-xs font-semibold">
              {t("newHighlight")}
            </span>
          </button>
        ) : null}

        {isPending
          ? Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="flex w-[84px] shrink-0 flex-col items-center gap-2">
                <Skeleton className="size-[77px] rounded-full" />
                <Skeleton className="h-3 w-14" />
              </div>
            ))
          : highlights.map((highlight) => (
              <div
                key={highlight.id}
                className="relative flex w-[84px] shrink-0 flex-col items-center gap-2"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(highlight.id)}
                  className="flex flex-col items-center gap-2"
                >
                  <span className="border-ig-border relative size-[77px] overflow-hidden rounded-full border">
                    {highlight.coverUrl ? (
                      <Image
                        src={getImageUrl(highlight.coverUrl) ?? ""}
                        alt=""
                        fill
                        sizes="77px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="bg-ig-bg-secondary block size-full" />
                    )}
                  </span>
                  <span className="text-ig-text w-full truncate text-center text-xs font-semibold">
                    {highlight.title}
                  </span>
                </button>

                {/* Own highlights only — the endpoint refuses someone else's.
                    Deliberately a sibling of the opening button: a button inside
                    a button is invalid HTML and the outer click swallows it. */}
                {isMe ? (
                  <button
                    type="button"
                    onClick={() => setEditing(highlight)}
                    aria-label={t("editHighlight")}
                    className="bg-ig-elevated border-ig-border text-ig-text absolute top-0 right-0 rounded-full border p-1"
                  >
                    <Pencil className="size-3" />
                  </button>
                ) : null}
              </div>
            ))}
      </div>

      {isMe ? <CreateHighlightDialog open={createOpen} onOpenChange={setCreateOpen} /> : null}

      {editing ? (
        <EditHighlightDialog
          highlight={editing}
          open
          onOpenChange={(next) => !next && setEditing(null)}
        />
      ) : null}

      {openId ? (
        <HighlightViewer highlightId={openId} isMine={isMe} onClose={() => setOpenId(null)} />
      ) : null}
    </>
  );
}
