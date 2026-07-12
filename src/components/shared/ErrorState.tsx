"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="space-y-2">
        <h2 className="text-ig-text text-[22px] font-light">{title ?? t("title")}</h2>
        <p className="text-ig-text-secondary max-w-sm text-sm">{description ?? t("description")}</p>
      </div>
      {onRetry ? (
        <Button onClick={onRetry} className="bg-ig-primary hover:bg-ig-primary-hover text-white">
          {tCommon("retry")}
        </Button>
      ) : null}
    </div>
  );
}
