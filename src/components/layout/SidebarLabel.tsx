import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Sidebar row label. Hidden on the 73px rail (clipped by the nav's
 * overflow-hidden) and faded in when the rail expands — on hover, or from
 * 1264px up when the sidebar is not forced narrow.
 */
export function SidebarLabel({
  wide,
  bold = false,
  children,
}: {
  wide: boolean;
  bold?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "text-base whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100",
        wide && "xl:opacity-100",
        bold ? "font-bold" : "font-normal",
      )}
    >
      {children}
    </span>
  );
}
