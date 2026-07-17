"use client";

import { Eye, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { HeartIcon } from "@/components/icons";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useStoryDetail } from "@/hooks/useStories";

/**
 * ⚠️ The API has NO list of who viewed a story: `viewerDto` (only on
 * GetStoryById) is a pair of counters for the whole story — viewCount and
 * viewLike. So this sheet shows the two numbers, not faces (docs/BACKEND_BUGS.md
 * #11/#12) — a per-viewer list (avatar + username, like the real IG "Кто
 * посмотрел" screen) would mean inventing user data that isn't real.
 *
 * Styled permanently dark — the story viewer itself is always a black
 * overlay regardless of site theme, so a theme-reactive (light-in-light-mode)
 * sheet popping up on top of it read as a mismatched, unstyled dialog.
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
  const tCommon = useTranslations("common");
  const { data, isPending, isError, refetch } = useStoryDetail(storyId, open);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="mx-auto w-full max-w-[420px] rounded-t-xl border-none bg-neutral-800 text-white"
      >
        <SheetHeader className="relative flex-row items-center justify-center border-b border-white/10 pb-3">
          <button
            type="button"
            aria-label={tCommon("close")}
            onClick={() => onOpenChange(false)}
            className="absolute left-4 text-white/80 hover:text-white"
          >
            <X className="size-5" />
          </button>
          <SheetTitle className="text-base font-semibold text-white">{t("viewers")}</SheetTitle>
        </SheetHeader>

        {isPending ? (
          <Loader className="py-8" />
        ) : isError || !data ? (
          <ErrorState onRetry={() => void refetch()} className="py-8" />
        ) : (
          <div className="flex gap-8 px-4 pb-2">
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

        <p className="px-4 pb-6 text-xs text-white/50">{t("viewersOnlyCounts")}</p>
      </SheetContent>
    </Sheet>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-white">{icon}</span>
      <div>
        <p className="text-lg font-semibold text-white">{value}</p>
        <p className="text-xs text-white/60">{label}</p>
      </div>
    </div>
  );
}
