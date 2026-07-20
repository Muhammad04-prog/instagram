"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PostGrid, PostGridSkeleton } from "@/components/profile/PostGrid";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useMusicReels } from "@/hooks/useMusic";
import { flattenPages } from "@/lib/cursor";

/** "Use this audio" — `GET /music/{id}/reels`. */
export function MusicReelsDialog({
  trackId,
  open,
  onOpenChange,
}: {
  trackId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("music");
  const { data, isPending, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useMusicReels(trackId, open);

  const reels = flattenPages(data);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-ig-elevated flex max-h-[80vh] w-[500px] flex-col gap-0 overflow-hidden rounded-xl p-0">
        <div className="border-ig-separator border-b py-3 text-center">
          <DialogTitle className="text-ig-text text-base font-bold">{t("reelsTitle")}</DialogTitle>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {isPending ? (
            <PostGridSkeleton />
          ) : isError ? (
            <ErrorState onRetry={() => void refetch()} className="py-10" />
          ) : reels.length === 0 ? (
            <EmptyState title={t("noReelsForTrack")} className="py-10" />
          ) : (
            <>
              <PostGrid posts={reels} />
              {hasNextPage ? (
                <button
                  type="button"
                  onClick={() => void fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="text-ig-primary w-full py-3 text-sm font-semibold disabled:opacity-50"
                >
                  {t("loadMore")}
                </button>
              ) : null}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
