"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * The thin gradient bar Instagram slides across the very top while a page
 * loads. App Router gives no router events, so we start the bar when an internal
 * link is clicked (or on back/forward) and finish it when `usePathname` reports
 * the new route has committed — the same trick every "top loader" uses.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const loadingRef = useRef(false);

  // Kick the bar off on internal navigations.
  useEffect(() => {
    function start() {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setVisible(true);
      setWidth(8);
    }

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      try {
        const url = new URL(anchor.href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname && url.search === window.location.search) {
          return;
        }
        start();
      } catch {
        // A malformed href is not a navigation we track.
      }
    }

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", start);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", start);
    };
  }, []);

  // Creep toward 90% while the route is still resolving.
  useEffect(() => {
    if (!visible) return;
    const id = window.setInterval(() => {
      setWidth((current) => (current < 90 ? current + (90 - current) * 0.12 : current));
    }, 220);
    return () => window.clearInterval(id);
  }, [visible]);

  // The route committed: snap to full, then fade out and reset.
  useEffect(() => {
    if (!loadingRef.current) return;
    loadingRef.current = false;
    setWidth(100);
    const hide = window.setTimeout(() => setVisible(false), 260);
    const reset = window.setTimeout(() => setWidth(0), 520);
    return () => {
      window.clearTimeout(hide);
      window.clearTimeout(reset);
    };
  }, [pathname]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]">
      <div
        className="h-full transition-[width,opacity] duration-200 ease-out"
        style={{
          width: `${width}%`,
          opacity: visible ? 1 : 0,
          background: "var(--ig-story-gradient)",
          boxShadow: "0 0 10px rgba(219,39,119,0.7), 0 0 5px rgba(219,39,119,0.5)",
        }}
      />
    </div>
  );
}
