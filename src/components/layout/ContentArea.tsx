"use client";

import type { ReactNode } from "react";
import { useSidebarForcedCollapsed } from "@/hooks/useSidebarState";
import { cn } from "@/lib/utils";

/**
 * Reserves the sidebar's gutter. The hover-expanded rail floats above this area
 * (it is `fixed`), so the gutter never changes on hover and the page does not
 * shift — the same trick IG uses.
 */
export function ContentArea({ children }: { children: ReactNode }) {
  const forcedCollapsed = useSidebarForcedCollapsed();

  return (
    <div
      className={cn(
        "pt-navbar pb-mobilenav md:pl-sidebar-collapsed md:pt-0 md:pb-0",
        // Same duration/easing as the Sidebar's own width transition so the
        // content gutter and the rail move in lockstep instead of snapping.
        "transition-[padding-left] duration-200 ease-in-out",
        !forcedCollapsed && "xl:pl-sidebar",
      )}
    >
      {children}
    </div>
  );
}
