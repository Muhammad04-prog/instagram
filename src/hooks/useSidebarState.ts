"use client";

import { usePathname } from "@/i18n/navigation";
import { useUiStore } from "@/store/ui.store";

/**
 * The sidebar is *forced* narrow on /chat, /explore and /reels, and while a
 * slide-out panel is open. Otherwise it is narrow below 1264px and full-width
 * above — that part is pure CSS (`xl:`), so both the sidebar and the content
 * padding derive from this single flag.
 */
export function useSidebarForcedCollapsed(): boolean {
  const pathname = usePathname();
  const panel = useUiStore((s) => s.panel);

  return (
    pathname.startsWith("/chat") ||
    pathname.startsWith("/explore") ||
    pathname.startsWith("/reels") ||
    panel !== null
  );
}
