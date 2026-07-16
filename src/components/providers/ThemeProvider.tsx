"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

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
