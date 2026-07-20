"use client";

import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { usePostInsights } from "@/hooks/usePosts";
import { formatCount } from "@/lib/utils";

/**
 * Author-only post analytics — `GET /posts/{id}/insights`, new in the
 * 19.07.2026 swagger refresh. No screenshot for this exists; the layout
 * follows the DTO itself (a stat grid + a discovery-source list) rather than
 * inventing chart types the API cannot back with real numbers.
 */
export function PostInsightsDialog({
  postId,
  open,
  onOpenChange,
}: {
  postId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("post");
  const { data, isPending, isError, refetch } = usePostInsights(postId, open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-ig-elevated flex max-h-[80vh] w-[400px] flex-col gap-0 overflow-hidden rounded-xl p-0">
        <div className="border-ig-separator border-b py-3 text-center">
          <DialogTitle className="text-ig-text text-base font-bold">
            {t("insightsTitle")}
          </DialogTitle>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isPending ? (
            <Loader className="py-10" />
          ) : isError || !data ? (
            <ErrorState onRetry={() => void refetch()} className="py-10" />
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Stat label={t("insightsReach")} value={formatCount(data.reach)} />
                <Stat
                  label={t("insightsEngagementRate")}
                  value={`${Math.round(data.engagementRate * 100)}%`}
                />
                <Stat label={t("insightsLikes")} value={formatCount(data.likes)} />
                <Stat label={t("insightsComments")} value={formatCount(data.comments)} />
                <Stat label={t("insightsSaves")} value={formatCount(data.saves)} />
                <Stat label={t("insightsShares")} value={formatCount(data.shares)} />
                <Stat label={t("insightsFromFollowers")} value={formatCount(data.fromFollowers)} />
                <Stat
                  label={t("insightsFromNonFollowers")}
                  value={formatCount(data.fromNonFollowers)}
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-ig-text text-sm font-semibold">{t("insightsSources")}</h3>
                {data.sources.length === 0 ? (
                  <p className="text-ig-text-secondary text-sm">{t("insightsNoSources")}</p>
                ) : (
                  <ul className="space-y-1.5">
                    {data.sources.map((row) => (
                      <li
                        key={row.source}
                        className="text-ig-text flex items-center justify-between text-sm"
                      >
                        <span className="capitalize">{row.source}</span>
                        <span className="text-ig-text-secondary">{formatCount(row.count)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ig-button-secondary rounded-lg px-3 py-2">
      <p className="text-ig-text text-lg font-semibold">{value}</p>
      <p className="text-ig-text-secondary text-xs">{label}</p>
    </div>
  );
}
