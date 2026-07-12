"use client";

import { UserAvatar } from "@/components/shared/UserAvatar";
import { cn } from "@/lib/utils";

/**
 * Gradient ring = unseen, grey ring = seen (docs/screenshots/img10). "Seen" is a
 * client-side fact — the API never says whether I viewed a story.
 */
export function StoryRing({
  src,
  alt,
  seen,
  size = 56,
  className,
}: {
  src: string | null;
  alt: string;
  seen: boolean;
  size?: number;
  className?: string;
}) {
  return (
    <span
      style={{ width: size + 8, height: size + 8 }}
      className={cn(
        "inline-flex items-center justify-center rounded-full p-[2px]",
        seen ? "bg-ig-border" : "story-ring",
        className,
      )}
    >
      <span className="bg-ig-bg flex size-full items-center justify-center rounded-full p-[2px]">
        <UserAvatar src={src} alt={alt} size={size} />
      </span>
    </span>
  );
}
