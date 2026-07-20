"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PostGrid, PostGridSkeleton } from "@/components/profile/PostGrid";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { usePostRemixes } from "@/hooks/usePosts";
import { flattenPages } from "@/lib/cursor";

/** Other reels made with this one as their base — `GET /posts/{id}/remixes`. */
export function PostRemixesDialog({
  postId,
  open,
  onOpenChange,
}: {
  postId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("post");
  const { data, isPending, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    usePostRemixes(postId, open);

  const remixes = flattenPages(data);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-ig-elevated flex max-h-[80vh] w-[500px] flex-col gap-0 overflow-hidden rounded-xl p-0">
        <div className="border-ig-separator border-b py-3 text-center">
          <DialogTitle className="text-ig-text text-base font-bold">
            {t("remixesTitle")}
          </DialogTitle>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {isPending ? (
            <PostGridSkeleton />
          ) : isError ? (
            <ErrorState onRetry={() => void refetch()} className="py-10" />
          ) : remixes.length === 0 ? (
            <EmptyState title={t("noRemixes")} className="py-10" />
          ) : (
            <>
              <PostGrid posts={remixes} />
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
