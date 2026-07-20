"use client";

import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useStickerResults } from "@/hooks/useStories";

interface OptionTally {
  index?: number;
  count?: number;
  percent?: number;
}
interface QuestionResponse {
  user?: { userName?: string };
  text?: string;
}

/** Author-only tally for one sticker — `GET /stories/{id}/stickers/{stickerId}/results`. */
export function StickerResultsDialog({
  storyId,
  stickerId,
  type,
  open,
  onOpenChange,
}: {
  storyId: number;
  stickerId: string;
  type: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("story");
  const { data, isPending, isError, refetch } = useStickerResults(storyId, stickerId, open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-ig-elevated w-[340px] gap-0 overflow-hidden rounded-xl p-0">
        <div className="border-ig-separator border-b py-3 text-center">
          <DialogTitle className="text-ig-text text-base font-bold">
            {t("stickerResultsTitle")}
          </DialogTitle>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {isPending ? (
            <Loader className="py-10" />
          ) : isError || !data ? (
            <ErrorState onRetry={() => void refetch()} className="py-10" />
          ) : data.total === 0 ? (
            <p className="text-ig-text-secondary py-6 text-center text-sm">
              {t("stickerResultsNone")}
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-ig-text-secondary text-sm">
                {t("stickerResultsTotal", { count: data.total })}
              </p>

              {(type === "POLL" || type === "QUIZ") && data.options ? (
                <ul className="space-y-2">
                  {(data.options as OptionTally[]).map((option, index) => (
                    <li key={index}>
                      <div className="text-ig-text mb-1 flex justify-between text-sm">
                        <span>{t("stickerOption", { n: (option.index ?? index) + 1 })}</span>
                        <span>{Math.round(option.percent ?? 0)}%</span>
                      </div>
                      <div className="bg-ig-button-secondary h-1.5 overflow-hidden rounded-full">
                        <div
                          className="bg-ig-primary h-full rounded-full"
                          style={{ width: `${Math.round(option.percent ?? 0)}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}

              {type === "SLIDER" && data.average !== undefined ? (
                <p className="text-ig-text text-2xl font-semibold">
                  {t("stickerResultsAverage", { value: Math.round(data.average * 100) / 100 })}
                </p>
              ) : null}

              {type === "QUESTION" && data.responses ? (
                <ul className="space-y-2">
                  {(data.responses as QuestionResponse[]).map((response, index) => (
                    <li key={index} className="text-ig-text text-sm">
                      <span className="font-semibold">{response.user?.userName}</span>{" "}
                      {response.text}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
