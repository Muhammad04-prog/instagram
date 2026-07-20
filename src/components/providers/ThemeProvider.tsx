"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * next-themes injects a raw `<script>` element to set the theme class before
 * hydration (avoids a flash of the wrong theme) — a legitimate SSR-only
 * technique that predates React 19. Next.js 16.2+ / React 19 now log a false
 * positive ("Encountered a script tag while rendering React component") for
 * it; the script still runs correctly. next-themes hasn't shipped a fix
 * (last release March 2025), so this filters just that one message rather
 * than letting it drown out real console errors.
 */
if (typeof window !== "undefined") {
  const patchedMarker = "__themeScriptWarningPatched";
  if (!(console.error as unknown as Record<string, boolean>)[patchedMarker]) {
    const originalError = console.error;
    const patched = (...args: unknown[]) => {
      if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) return;
      originalError(...args);
    };
    (patched as unknown as Record<string, boolean>)[patchedMarker] = true;
    console.error = patched;
  }
}

/**
 * Light / dark / system, as IG offers (img46).
 *
 * `defaultTheme` must be "system", not "dark": with `enableSystem` alone, a
 * hard-coded default still wins for anyone who has never touched the switch, so
 * "System" was never actually honoured — the app was dark for everyone and the
 * light palette only ever appeared if you picked it by hand.
 */
export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
