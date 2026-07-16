"use client";

import { UserAvatar } from "@/components/shared/UserAvatar";
import { cn } from "@/lib/utils";

/**
 * Gradient ring = unseen, grey = seen, **green = close friends only**
 * (docs/screenshots/img10).
 *
 * Both facts are server truth now. "Seen" used to be a client-side guess kept in
 * localStorage — softclub could not answer "have I viewed this?" — and the green
 * ring could not exist at all, because close friends did not exist.
 */
export function StoryRing({
  src,
  alt,
  seen,
  closeFriends = false,
  size = 56,
  className,
}: {
  src: string | null;
  alt: string;
  seen: boolean;
  /** `StoryRailItemDto.hasCloseFriends` — the author posted for close friends only. */
  closeFriends?: boolean;
  size?: number;
  className?: string;
}) {
  return (
    <span
      style={{ width: size + 8, height: size + 8 }}
      className={cn(
        "inline-flex items-center justify-center rounded-full p-[2px]",
        // Seen wins over green: a watched close-friends story still greys out,
        // exactly as a normal one does.
        seen ? "bg-ig-border" : closeFriends ? "bg-ig-close-friends" : "story-ring",
        className,
      )}
    >
      <span className="bg-ig-bg flex size-full items-center justify-center rounded-full p-[2px]">
        <UserAvatar src={src} alt={alt} size={size} />
      </span>
    </span>
  );
}
