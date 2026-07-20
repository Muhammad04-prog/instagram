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
 *
 * Geometry follows live IG's feed rail: a 3px coloured band, a 2px gap punched
 * out in the page background, then the avatar. The gap is what makes the ring
 * read as a ring rather than a coloured border.
 */
export function StoryRing({
  src,
  alt,
  seen,
  closeFriends = false,
  size = 64,
  className,
  gapClassName,
}: {
  src: string | null;
  alt: string;
  seen: boolean;
  /** `StoryRailItemDto.hasCloseFriends` — the author posted for close friends only. */
  closeFriends?: boolean;
  size?: number;
  className?: string;
  /**
   * The punched-out gap defaults to the page background. Anywhere the ring sits
   * on something else — the story deck's dark stage — that has to be overridden
   * or the gap shows as a pale halo.
   */
  gapClassName?: string;
}) {
  return (
    <span
      style={{ width: size + 10, height: size + 10 }}
      className={cn(
        "inline-flex items-center justify-center rounded-full p-[3px] transition-transform duration-150",
        // Seen wins over green: a watched close-friends story still greys out,
        // exactly as a normal one does.
        seen ? "bg-ig-border" : closeFriends ? "bg-ig-close-friends" : "story-ring",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-full items-center justify-center rounded-full p-[2px]",
          gapClassName ?? "bg-ig-bg",
        )}
      >
        <UserAvatar src={src} alt={alt} size={size} />
      </span>
    </span>
  );
}
