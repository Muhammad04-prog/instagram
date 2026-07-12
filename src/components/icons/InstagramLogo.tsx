import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

/** The glyph (camera outline) — sidebar collapsed state, mobile header. */
export function InstagramGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** The wordmark — sidebar expanded, auth pages. Uses the Grand Hotel font. */
export function InstagramWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-logo text-ig-text text-[29px] leading-none", className)}>
      Instagram
    </span>
  );
}
