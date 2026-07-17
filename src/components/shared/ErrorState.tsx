"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useHealth } from "@/hooks/useHealth";
import { cn } from "@/lib/utils";

/**
 * Something failed. Rather than always shrugging "Something went wrong", ask
 * `/health` — the one endpoint that answers without a token and says *why* —
 * and name the side that is actually broken.
 *
 * It only asks when a caller offers a retry, i.e. on a real data failure; a
 * decorative error with no retry does not need a diagnosis. If health cannot be
 * reached either, the generic message stands: that is honest, we then genuinely
 * do not know.
 */
export function ErrorState({
  title,
  description,
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  const t = useTranslations("errors");
  const tCommon = useTranslations("common");

  // Don't second-guess a caller that already knows what to say.
  const diagnose = Boolean(onRetry) && !description;
  const { data: health } = useHealth(diagnose);

  const degraded = health?.status === "degraded";
  const shownDescription = description ?? (degraded ? t("serviceDown") : t("description"));

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="space-y-2">
        <h2 className="text-ig-text text-[22px] font-light">
          {title ?? (degraded ? t("serviceDownTitle") : t("title"))}
        </h2>
        <p className="text-ig-text-secondary max-w-sm text-sm">{shownDescription}</p>
      </div>
      {onRetry ? (
        <Button onClick={onRetry} className="bg-ig-primary hover:bg-ig-primary-hover text-white">
          {tCommon("retry")}
        </Button>
      ) : null}
    </div>
  );
}
