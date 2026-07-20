import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * A single settings list row: title (+ optional description) on the left, a
 * chevron on the right. Real IG hides real screens behind most of these
 * arrows; where we have no reference screenshot AND no real endpoint behind
 * one, the row stays inert (no `href`) rather than inventing a screen. Pass
 * `href` only once there is somewhere real for it to go.
 */
export function SettingsRow({
  title,
  description,
  right,
  chevron = true,
  href,
  className,
}: {
  title: string;
  description?: string;
  right?: ReactNode;
  chevron?: boolean;
  href?: string;
  className?: string;
}) {
  const content = (
    <>
      <span className="min-w-0 flex-1">
        <span className="text-ig-text block text-sm">{title}</span>
        {description ? (
          <span className="text-ig-text-secondary mt-1 block text-xs">{description}</span>
        ) : null}
      </span>
      {right}
      {chevron ? <ChevronRight className="text-ig-text-secondary size-5 shrink-0" /> : null}
    </>
  );

  const rowClassName = cn(
    "border-ig-border flex items-center gap-4 rounded-2xl border px-4 py-4",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={rowClassName}>
        {content}
      </Link>
    );
  }

  return <div className={rowClassName}>{content}</div>;
}

/** Stack of SettingsRow with a 1px gap, like IG's grouped lists. */
export function SettingsRowGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-2", className)}>{children}</div>;
}

/**
 * Banner for screens built entirely from local `useState` with no backing
 * endpoint (see `SettingsToggleRow`/`SettingsRadioGroup` file comments) — the
 * controls below stay visible but disabled, and this explains why, instead of
 * a switch that flips with no real effect. Takes the message as a prop
 * (rather than calling `useTranslations` itself) so this file can stay
 * server/client-agnostic — both async server pages and "use client" screens
 * already have a `t` in scope.
 */
export function SettingsUnavailableNotice({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "bg-ig-bg-secondary text-ig-text-secondary rounded-lg px-4 py-3 text-sm",
        className,
      )}
    >
      {children}
    </p>
  );
}
