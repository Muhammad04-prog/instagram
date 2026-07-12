import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Loader({
  className,
  size = 24,
  label,
}: {
  className?: string;
  size?: number;
  label?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center gap-2 py-6", className)} role="status">
      <Loader2 className="text-ig-text-secondary animate-spin" width={size} height={size} />
      {label ? <span className="text-ig-text-secondary text-sm">{label}</span> : null}
      <span className="sr-only">{label ?? "Loading"}</span>
    </div>
  );
}
