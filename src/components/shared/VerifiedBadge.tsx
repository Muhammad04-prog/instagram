import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * The blue check.
 *
 * Drawn inline rather than pulled from lucide: this is Instagram's own glyph
 * (a scalloped rosette, not a circle), and it has to sit next to a username at
 * any size without looking like a generic "check-circle".
 *
 * Verification is real data now — `isVerified` rides on every user DTO, and
 * `/verification` sells it (Phase 20). Softclub had no such concept.
 */
export function VerifiedBadge({ className }: { className?: string }) {
  const t = useTranslations("profile");

  return (
    <svg
      viewBox="0 0 40 40"
      role="img"
      aria-label={t("verified")}
      className={cn("text-ig-primary inline-block size-3 shrink-0", className)}
    >
      <path
        fill="currentColor"
        d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h6.234L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.058v-6.348L40 25.359 36.905 20 40 14.641l-5.351-3.09v-6.4h-6.093L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z"
      />
    </svg>
  );
}

/**
 * Username + badge, so the badge can never drift away from the name it belongs
 * to or be forgotten on a new screen.
 */
export function UserNameWithBadge({
  userName,
  isVerified,
  className,
  badgeClassName,
}: {
  userName: string;
  isVerified: boolean;
  className?: string;
  badgeClassName?: string;
}) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1", className)}>
      <span className="truncate">{userName}</span>
      {isVerified ? <VerifiedBadge className={badgeClassName} /> : null}
    </span>
  );
}
