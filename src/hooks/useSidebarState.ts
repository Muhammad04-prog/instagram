"use client";

import { usePathname } from "@/i18n/navigation";
import { useUiStore } from "@/store/ui.store";

/**
 * The sidebar is *forced* narrow on /chat, /explore, /reels and /settings, and
 * while a slide-out panel is open. Otherwise it is narrow below 1264px and
 * full-width above — that part is pure CSS (`xl:`), so both the sidebar and
 * the content padding derive from this single flag.
 */
export function useSidebarForcedCollapsed(): boolean {
  const pathname = usePathname();
  const panel = useUiStore((s) => s.panel);

  return (
    pathname.startsWith("/chat") ||
    pathname.startsWith("/explore") ||
    pathname.startsWith("/reels") ||
    pathname.startsWith("/settings") ||
    panel !== null
  );
}

/**
 * True when hover-to-expand must stay off entirely: a slide-out panel or the
 * Settings two-column layout anchor content against the 73px rail, so
 * widening on hover would overlap it. This is narrower than
 * useSidebarForcedCollapsed — /chat, /explore and /reels are narrow at rest
 * but still expand fine on hover, so they're deliberately excluded here.
 */
export function useSidebarHoverLocked(): boolean {
  const pathname = usePathname();
  const panel = useUiStore((s) => s.panel);

  return pathname.startsWith("/settings") || panel !== null;
}
