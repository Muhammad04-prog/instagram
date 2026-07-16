"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Loader } from "@/components/shared/Loader";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUpdateHighlight } from "@/hooks/useHighlights";
import { useMyStories, useStoryArchive } from "@/hooks/useStories";
import { cn, getImageUrl } from "@/lib/utils";
import type { HighlightDto } from "@/types/api.types";

/**
 * Rename a highlight and re-pick what is in it.
 *
 * `storyIds` **replaces** the contents rather than adding to them, and
 * `HighlightDto` does not say which stories are already inside — it only carries
 * a `count`. So the picker cannot pre-select the current ones, and saving an
 * empty selection would silently empty the highlight. Hence: at least one story
 * must be picked, and the copy says the choice replaces what is there.
 *
 * The first picked story becomes the cover, as when creating one.
 */
export function EditHighlightDialog({
  highlight,
  open,
  onOpenChange,
}: {
  highlight: HighlightDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("story");
  const tCommon = useTranslations("common");
  const [title, setTitle] = useState(highlight.title);
  const [picked, setPicked] = useState<number[]>([]);

  const archive = useStoryArchive();
  const { data: live } = useMyStories();
  const update = useUpdateHighlight();

  const stories = [...(live ?? []), ...(archive.data?.pages.flat() ?? [])];
  const seen = new Set<number>();
  const unique = stories.filter((story) => !seen.has(story.id) && seen.add(story.id));

  const renamed = title.trim() !== highlight.title;
  const recomposed = picked.length > 0;

  const submit = () => {
    const cover = unique.find((story) => story.id === picked[0]);
    update.mutate(
      {
        id: highlight.id,
        dto: {
          ...(renamed ? { title: title.trim() } : {}),
          // Only send what changed: an empty storyIds would wipe the highlight.
          ...(recomposed ? { storyIds: picked } : {}),
          ...(recomposed && cover ? { coverUrl: cover.mediaUrl } : {}),
        },
      },
      {
        onSuccess: () => {
          toast.success(t("highlightUpdated"));
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-ig-elevated flex h-[560px] w-[420px] flex-col gap-0 overflow-hidden rounded-xl p-0"
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
            {t("editHighlight")}
          </DialogTitle>
          <button
            type="button"
            disabled={!title.trim() || (!renamed && !recomposed) || update.isPending}
            onClick={submit}
            className="text-ig-primary text-sm font-semibold disabled:opacity-40"
          >
            {tCommon("done")}
          </button>
        </div>

        <div className="border-ig-separator border-b p-4">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value.slice(0, 30))}
            placeholder={t("highlightTitle")}
            aria-label={t("highlightTitle")}
            className="border-ig-border text-ig-text h-11 rounded-lg"
          />
        </div>

        <p className="text-ig-text-secondary px-4 pt-3 text-xs">
          {t("editHighlightHint", { count: highlight.count })}
        </p>

        <div className="flex-1 scrollbar-none overflow-y-auto p-2">
          {archive.isPending ? (
            <Loader className="py-10" />
          ) : unique.length === 0 ? (
            <EmptyState title={t("noArchivedStories")} className="py-10" />
          ) : (
            <ul className="grid grid-cols-3 gap-1">
              {unique.map((story) => {
                const index = picked.indexOf(story.id);
                const active = index !== -1;
                return (
                  <li key={story.id}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() =>
                        setPicked((all) =>
                          active ? all.filter((id) => id !== story.id) : [...all, story.id],
                        )
                      }
                      className="relative block aspect-[9/16] w-full overflow-hidden rounded"
                    >
                      <Image
                        src={getImageUrl(story.thumbUrl ?? story.mediaUrl) ?? ""}
                        alt=""
                        fill
                        sizes="120px"
                        className={cn("object-cover", active && "opacity-60")}
                      />
                      {active ? (
                        <span className="bg-ig-primary absolute top-1 right-1 flex size-5 items-center justify-center rounded-full text-[11px] font-semibold text-white">
                          {index + 1}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
