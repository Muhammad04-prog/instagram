"use client";

import { useTranslations } from "next-intl";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { cn } from "@/lib/utils";

/**
 * A live host in the story rail: the same gradient ring, but with the LIVE tag
 * sitting on the bottom edge — which is how IG marks one.
 *
 * A live ring never greys out. "Seen" is meaningless for something happening
 * right now, so unlike `StoryRing` there is no seen state to carry.
 */
export function LiveRing({
  src,
  alt,
  size = 64,
  className,
}: {
  src: string | null;
  alt: string;
  size?: number;
  className?: string;
}) {
  const t = useTranslations("live");

  return (
    <span className={cn("relative inline-flex", className)}>
      {/* Same band/gap geometry as `StoryRing`, so live hosts line up with
          everyone else in the rail instead of sitting 2px small. */}
      <span
        style={{ width: size + 10, height: size + 10 }}
        className="story-ring inline-flex items-center justify-center rounded-full p-[3px]"
      >
        <span className="bg-ig-bg flex size-full items-center justify-center rounded-full p-[2px]">
          <UserAvatar src={src} alt={alt} size={size} />
        </span>
      </span>

      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 rounded-md border border-[color:var(--ig-bg)] bg-[color:var(--ig-danger)] px-1.5 text-[9px] font-bold tracking-wide text-white">
        {t("badge")}
      </span>
    </span>
  );
}
