"use client";

import { useEffect, useState } from "react";
import { InstagramGlyph } from "@/components/icons/InstagramGlyph";
import { MetaLogo } from "@/components/icons/MetaLogo";
import { cn } from "@/lib/utils";

/**
 * Instagram's open-the-app splash: the gradient glyph centred, "from Meta" near
 * the bottom. Rendered in the root layout so it is in the very first HTML and
 * covers the initial paint; it fades out once the app has hydrated. The root
 * layout persists across client navigations, so this mounts once per hard load
 * and never flashes again on in-app navigation (that gets the top bar instead).
 */
export function SplashScreen() {
  const [phase, setPhase] = useState<"show" | "fading" | "gone">("show");

  useEffect(() => {
    const fade = window.setTimeout(() => setPhase("fading"), 650);
    const gone = window.setTimeout(() => setPhase("gone"), 1050);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(gone);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      aria-hidden
      className={cn(
        "bg-ig-bg fixed inset-0 z-[200] flex flex-col items-center justify-center transition-opacity duration-400 ease-out",
        phase === "fading" && "pointer-events-none opacity-0",
      )}
    >
      <InstagramGlyph size={72} className="animate-pulse" />
      <div className="absolute bottom-10 flex flex-col items-center gap-1.5">
        <span className="text-ig-text-secondary text-xs">from</span>
        <MetaLogo />
      </div>
    </div>
  );
}
