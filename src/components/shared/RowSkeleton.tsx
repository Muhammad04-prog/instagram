import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Instagram's list placeholder: a circular avatar next to two text lines,
 * repeated. Used while the DM list and the notifications feed load, so the panel
 * has shape instead of a lone spinner.
 */
export function RowSkeleton({ rows = 7, className }: { rows?: number; className?: string }) {
  return (
    <ul className={cn("py-1", className)}>
      {Array.from({ length: rows }, (_, index) => (
        <li key={index} className="flex items-center gap-3 px-4 py-2.5">
          <Skeleton className="size-11 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/3 rounded" />
            <Skeleton className="h-3 w-1/2 rounded" />
          </div>
        </li>
      ))}
    </ul>
  );
}
