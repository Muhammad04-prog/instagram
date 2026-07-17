"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Loader } from "@/components/shared/Loader";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateHighlight } from "@/hooks/useHighlights";
import { useMyStories, useStoryArchive } from "@/hooks/useStories";
import { cn, getImageUrl } from "@/lib/utils";
import { flattenPages } from "@/lib/cursor";

/**
 * "New highlight": pick stories, name it.
 *
 * The picker reads **the archive plus what is still live** — a highlight is
 * built from stories that already happened, and most of them have expired by
 * then. Softclub had neither an archive nor highlights.
 *
 * The cover defaults to the first chosen story: `coverUrl` is optional, and the
 * alternative would be asking for an upload before there is anything to cover.
 */
export function CreateHighlightDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("story");
  const tCommon = useTranslations("common");
  const [title, setTitle] = useState("");
  const [picked, setPicked] = useState<number[]>([]);

  const archive = useStoryArchive();
  const { data: live } = useMyStories();
  const create = useCreateHighlight();

  // Live stories first — they are the ones a person just posted and wants to keep.
  const stories = [...(live ?? []), ...flattenPages(archive.data)];
  const seen = new Set<number>();
  const unique = stories.filter((story) => !seen.has(story.id) && seen.add(story.id));

  const close = () => {
    setTitle("");
    setPicked([]);
    onOpenChange(false);
  };

  const submit = () => {
    const cover = unique.find((story) => story.id === picked[0]);
    create.mutate(
      {
        title: title.trim(),
        storyIds: picked,
        ...(cover ? { coverUrl: cover.mediaUrl } : {}),
      },
      {
        onSuccess: () => {
          toast.success(t("highlightCreated"));
          close();
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
          <button type="button" onClick={close} className="text-ig-text text-sm">
            {tCommon("cancel")}
          </button>
          <DialogTitle className="text-ig-text text-base font-semibold">
            {t("newHighlight")}
          </DialogTitle>
          <button
            type="button"
            disabled={!title.trim() || picked.length === 0 || create.isPending}
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
                      {/* The number shows the order — it is also the cover pick:
                          #1 becomes the highlight's cover. */}
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
