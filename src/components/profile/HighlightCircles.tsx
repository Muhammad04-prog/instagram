"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import { CreateHighlightDialog } from "@/components/story/CreateHighlightDialog";
import { HighlightViewer } from "@/components/story/HighlightViewer";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserHighlights } from "@/hooks/useHighlights";
import { getImageUrl } from "@/lib/utils";

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
              <button
                key={highlight.id}
                type="button"
                onClick={() => setOpenId(highlight.id)}
                className="flex w-[84px] shrink-0 flex-col items-center gap-2"
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
            ))}
      </div>

      {isMe ? <CreateHighlightDialog open={createOpen} onOpenChange={setCreateOpen} /> : null}

      {openId ? (
        <HighlightViewer highlightId={openId} isMine={isMe} onClose={() => setOpenId(null)} />
      ) : null}
    </>
  );
}
