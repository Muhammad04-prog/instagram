import Image from "next/image";
import { cn, getImageUrl } from "@/lib/utils";

/**
 * Round avatar with IG's default-person fallback, used whenever the API returns
 * an empty `image`/`avatar` (most accounts have none).
 */
export function UserAvatar({
  src,
  alt = "",
  size = 24,
  className,
  priority = false,
}: {
  src: string | null | undefined;
  alt?: string;
  size?: number;
  className?: string;
  /** For avatars that are visible on first paint (sidebar, profile header). */
  priority?: boolean;
}) {
  const url = getImageUrl(src);

  if (!url) {
    return (
      <span
        style={{ width: size, height: size }}
        className={cn(
          // --ig-elevated is #fff in light, which made the fallback invisible on
          // white; --ig-button-secondary is grey in both themes.
          "bg-ig-button-secondary text-ig-text-secondary inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
          className,
        )}
        aria-hidden
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-[70%]">
          <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
        </svg>
      </span>
    );
  }

  return (
    <Image
      src={url}
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      style={{ width: size, height: size }}
      className={cn("shrink-0 rounded-full object-cover", className)}
    />
  );
}
