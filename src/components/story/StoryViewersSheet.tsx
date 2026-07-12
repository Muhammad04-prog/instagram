"use client";

import { Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { HeartIcon } from "@/components/icons";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useStoryDetail } from "@/hooks/useStories";

/**
 * ⚠️ The API has NO list of who viewed a story: `viewerDto` (only on
 * GetStoryById) is a pair of counters for the whole story — viewCount and
 * viewLike. So this sheet shows the two numbers, not faces (docs/BACKEND_BUGS.md).
 */
export function StoryViewersSheet({
  storyId,
  open,
  onOpenChange,
}: {
  storyId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("story");
  const { data, isPending, isError, refetch } = useStoryDetail(storyId, open);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-ig-elevated rounded-t-xl">
        <SheetHeader>
          <SheetTitle className="text-ig-text">{t("viewers")}</SheetTitle>
        </SheetHeader>

        {isPending ? (
          <Loader className="py-8" />
        ) : isError || !data ? (
          <ErrorState onRetry={() => void refetch()} className="py-8" />
        ) : (
          <div className="flex gap-8 px-4 pb-8">
            <Stat
              icon={<Eye className="size-5" />}
              label={t("viewCount")}
              value={data.viewerDto?.viewCount ?? 0}
            />
            <Stat
              icon={<HeartIcon filled className="text-ig-danger size-5" />}
              label={t("viewLike")}
              value={data.viewerDto?.viewLike ?? 0}
            />
          </div>
        )}

        <p className="text-ig-text-secondary px-4 pb-4 text-xs">{t("viewersOnlyCounts")}</p>
      </SheetContent>
    </Sheet>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-ig-text">{icon}</span>
      <div>
        <p className="text-ig-text text-lg font-semibold">{value}</p>
        <p className="text-ig-text-secondary text-xs">{label}</p>
      </div>
    </div>
  );
}
