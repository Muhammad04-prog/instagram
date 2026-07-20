"use client";

import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useStoryInsights } from "@/hooks/useStories";
import { formatCount } from "@/lib/utils";

/** Author-only story analytics — `GET /stories/{id}/insights`. */
export function StoryInsightsDialog({
  storyId,
  open,
  onOpenChange,
}: {
  storyId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("story");
  const { data, isPending, isError, refetch } = useStoryInsights(storyId, open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-ig-elevated flex w-[360px] flex-col gap-0 overflow-hidden rounded-xl p-0">
        <div className="border-ig-separator border-b py-3 text-center">
          <DialogTitle className="text-ig-text text-base font-bold">
            {t("insightsTitle")}
          </DialogTitle>
        </div>

        <div className="p-4">
          {isPending ? (
            <Loader className="py-10" />
          ) : isError || !data ? (
            <ErrorState onRetry={() => void refetch()} className="py-10" />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Stat label={t("insightsViews")} value={formatCount(data.views)} />
              <Stat
                label={t("insightsEngagementRate")}
                value={`${Math.round(data.engagementRate * 100)}%`}
              />
              <Stat label={t("insightsLikes")} value={formatCount(data.likes)} />
              <Stat label={t("insightsReactions")} value={formatCount(data.reactions)} />
              <Stat label={t("insightsReplies")} value={formatCount(data.replies)} />
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
