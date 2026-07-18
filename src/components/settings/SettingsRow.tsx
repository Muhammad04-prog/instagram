import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A single settings list row: title (+ optional description) on the left, a
 * chevron on the right. Real IG hides real screens behind most of these
 * arrows; where we have no reference screenshot for what's behind one, the
 * row stays inert (no `href`, no onClick) rather than inventing a screen.
 */
export function SettingsRow({
  title,
  description,
  right,
  chevron = true,
  className,
}: {
  title: string;
  description?: string;
  right?: ReactNode;
  chevron?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-ig-border flex items-center gap-4 rounded-2xl border px-4 py-4",
        className,
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="text-ig-text block text-sm">{title}</span>
        {description ? (
          <span className="text-ig-text-secondary mt-1 block text-xs">{description}</span>
        ) : null}
      </span>
      {right}
      {chevron ? <ChevronRight className="text-ig-text-secondary size-5 shrink-0" /> : null}
    </div>
  );
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
