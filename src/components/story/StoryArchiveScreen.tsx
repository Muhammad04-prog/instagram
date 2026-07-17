"use client";

import { ChevronLeft, Trash2, X } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { ClipIcon } from "@/components/icons";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useDeleteStory, useStoryArchive, useStoryDetail } from "@/hooks/useStories";
import { useRouter } from "@/i18n/navigation";
import { getImageUrl } from "@/lib/utils";
import { flattenPages } from "@/lib/cursor";

/**
 * «Архивировать» → таб «Истории» (docs/screenshots/img45).
 *
 * A screen Phase 6 could not build: softclub had no archive, so an expired story
 * was simply gone. Four columns of 9:16 tiles, each stamped with its date.
 *
 * The archive is also what the highlight picker reads — this is the standalone
 * view of the same list.
 */
export function StoryArchiveScreen() {
  const t = useTranslations("story");
  const router = useRouter();
  const sentinel = useRef<HTMLDivElement>(null);
  const [openId, setOpenId] = useState<number | null>(null);

  const { data, isPending, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useStoryArchive();

  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasNextPage) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && !isFetchingNextPage) void fetchNextPage();
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const stories = flattenPages(data);

  return (
    <div className="mx-auto max-w-[935px] px-4 py-6">
      <header className="mb-8 flex items-center gap-4">
        <button type="button" onClick={() => router.back()} aria-label={t("back")}>
          <ChevronLeft className="text-ig-text size-6" />
        </button>
        <h1 className="text-ig-text text-xl font-semibold">{t("archiveTitle")}</h1>
      </header>

      {/* One tab, as in img45 — posts/live archives are not separate endpoints. */}
      <div className="border-ig-separator mb-6 flex justify-center border-b">
        <span className="border-ig-text text-ig-text flex items-center gap-2 border-b px-4 pb-3 text-xs font-semibold tracking-wider uppercase">
          <ClipIcon className="size-3.5" />
          {t("archiveTab")}
        </span>
      </div>

      <p className="text-ig-text-secondary mb-6 text-sm">{t("archiveHint")}</p>

      {isPending ? (
        <Loader className="py-10" />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : stories.length === 0 ? (
        <EmptyState title={t("archiveEmpty")} description={t("archiveEmptyDescription")} />
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stories.map((story) => (
              <li key={story.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(story.id)}
                  className="bg-ig-bg-secondary relative block aspect-[9/16] w-full overflow-hidden rounded-md"
                >
                  <Image
                    src={getImageUrl(story.thumbUrl ?? story.mediaUrl) ?? ""}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 50vw, 220px"
                    className="object-cover"
                  />
                  <DateBadge iso={story.createdAt} />
                </button>
              </li>
            ))}
          </ul>

          <div ref={sentinel} className="h-10" />
          {isFetchingNextPage ? <Loader /> : null}
        </>
      )}

      {openId !== null ? (
        <ArchivedStoryDialog storyId={openId} onClose={() => setOpenId(null)} />
      ) : null}
    </div>
  );
}

/**
 * The white date stamp in the tile's corner (img45): day big, month under it.
 *
 * The year only appears for a story from another year — a date needs it to stay
 * unambiguous, and img45 shows both forms.
 */
function DateBadge({ iso }: { iso: string }) {
  const format = useFormatter();
  const date = new Date(iso);
  const showYear = date.getFullYear() !== new Date().getFullYear();

  return (
    <span className="absolute top-2 left-2 rounded-md bg-white px-2 py-1 text-center leading-none text-black">
      <span className="block text-base font-bold">{format.dateTime(date, { day: "numeric" })}</span>
      <span className="block text-[11px]">{format.dateTime(date, { month: "short" })}</span>
      {showYear ? (
        <span className="block text-[10px] font-semibold">
          {format.dateTime(date, { year: "numeric" })}
        </span>
      ) : null}
    </span>
  );
}

/**
 * One archived story, opened from the grid.
 *
 * This is where `GET /stories/{id}` earns its place: the grid row is enough to
 * draw a tile, but opening it wants the whole story.
 */
function ArchivedStoryDialog({ storyId, onClose }: { storyId: number; onClose: () => void }) {
  const t = useTranslations("story");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: story, isPending, isError, refetch } = useStoryDetail(storyId);
  const remove = useDeleteStory();

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[420px] max-w-[95vw] gap-0 overflow-hidden rounded-lg border-0 bg-black p-0"
      >
        <div className="flex items-center justify-between px-3 py-2">
          <DialogTitle className="text-sm font-semibold text-white">
            {story ? format.dateTime(new Date(story.createdAt), { dateStyle: "long" }) : ""}
          </DialogTitle>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={t("deleteStory")}
              onClick={() => setConfirmOpen(true)}
              className="text-white/90 hover:text-white"
            >
              <Trash2 className="size-5" />
            </button>
            <button
              type="button"
              aria-label={tCommon("close")}
              onClick={onClose}
              className="text-white/90 hover:text-white"
            >
              <X className="size-6" />
            </button>
          </div>
        </div>

        {isPending ? (
          <Loader className="py-20" />
        ) : isError || !story ? (
          <ErrorState onRetry={() => void refetch()} className="py-20" />
        ) : (
          <div className="relative h-[70vh]">
            {story.mediaType === "VIDEO" ? (
              <video
                src={getImageUrl(story.mediaUrl) ?? ""}
                poster={story.thumbUrl ?? undefined}
                controls
                playsInline
                className="size-full object-contain"
              />
            ) : (
              <Image
                src={getImageUrl(story.mediaUrl) ?? ""}
                alt=""
                fill
                sizes="420px"
                className="object-contain"
                priority
              />
            )}
          </div>
        )}

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={t("deleteStory")}
          description={t("deleteStoryConfirm")}
          confirmLabel={tCommon("delete")}
          onConfirm={() => remove.mutate(storyId, { onSuccess: onClose })}
        />
      </DialogContent>
    </Dialog>
  );
}
