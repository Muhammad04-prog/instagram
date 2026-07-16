"use client";

import { Trash2, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useDeleteHighlight, useHighlight } from "@/hooks/useHighlights";
import { getImageUrl } from "@/lib/utils";

/**
 * A highlight, opened from the profile circles.
 *
 * Deliberately **not** the story viewer: a highlight has no 5-second timer and
 * no "seen" state — its stories are kept on purpose, so they are stepped through
 * by hand. `/highlights/{id}` is the only endpoint that returns them.
 */
export function HighlightViewer({
  highlightId,
  isMine,
  onClose,
}: {
  highlightId: string;
  isMine: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("story");
  const tCommon = useTranslations("common");
  const [index, setIndex] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data, isPending, isError, refetch } = useHighlight(highlightId);
  const remove = useDeleteHighlight();

  const stories = data?.stories ?? [];
  const current = stories[index];

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[420px] max-w-[95vw] gap-0 overflow-hidden rounded-lg border-0 bg-black p-0"
      >
        <div className="flex items-center justify-between px-3 py-2">
          <DialogTitle className="truncate text-sm font-semibold text-white">
            {data?.title ?? ""}
          </DialogTitle>
          <div className="flex items-center gap-3">
            {isMine ? (
              <button
                type="button"
                aria-label={t("deleteHighlight")}
                onClick={() => setConfirmOpen(true)}
                className="text-white/90 hover:text-white"
              >
                <Trash2 className="size-5" />
              </button>
            ) : null}
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
        ) : isError ? (
          <ErrorState onRetry={() => void refetch()} className="py-20" />
        ) : !current ? (
          <ErrorState title={t("noStories")} className="py-20" />
        ) : (
          <div className="relative h-[70vh]">
            <Image
              src={getImageUrl(current.mediaUrl) ?? ""}
              alt=""
              fill
              sizes="420px"
              className="object-contain"
              priority
            />

            {/* Tap zones, as in the story viewer — but no timer: a highlight is
                browsed, not played. */}
            <button
              type="button"
              aria-label={tCommon("previous")}
              onClick={() => setIndex((position) => Math.max(0, position - 1))}
              className="absolute inset-y-0 left-0 w-1/3"
            />
            <button
              type="button"
              aria-label={tCommon("next")}
              onClick={() => setIndex((position) => Math.min(stories.length - 1, position + 1))}
              className="absolute inset-y-0 right-0 w-1/3"
            />

            <div className="absolute top-0 right-0 left-0 flex gap-1 p-2">
              {stories.map((story, position) => (
                <span
                  key={story.id}
                  className={`h-0.5 flex-1 rounded-full ${
                    position <= index ? "bg-white" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={t("deleteHighlight")}
          // The backend keeps the stories; say so, or this reads as destructive.
          description={t("deleteHighlightConfirm")}
          confirmLabel={tCommon("delete")}
          onConfirm={() => remove.mutate(highlightId, { onSuccess: onClose })}
        />
      </DialogContent>
    </Dialog>
  );
}
