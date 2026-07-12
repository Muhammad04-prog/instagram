import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-6 py-16 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="border-ig-text flex size-24 items-center justify-center rounded-full border-2">
          {icon}
        </div>
      ) : null}
      <div className="space-y-2">
        <h2 className="text-ig-text text-[22px] font-light">{title}</h2>
        {description ? (
          <p className="text-ig-text-secondary max-w-sm text-sm">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
