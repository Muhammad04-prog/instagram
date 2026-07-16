"use client";

import { ChevronDown } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Date of birth as three dropdowns — Day / Month / Year — exactly as img4 shows
 * it. The API wants one `YYYY-MM-DD` string, so the parts are joined on change
 * and an incomplete date deliberately yields "" (the Zod regex then reports it).
 *
 * This block finally exists because the new RegisterDto requires `dob`; softclub
 * had no birthday field at all, which is why Phase 2 had to drop it from img4.
 *
 * Native <select> on purpose: the year list is ~100 rows and the OS picker is
 * both faster to scroll and better on mobile than a rebuilt listbox.
 */

const OLDEST_YEAR = 1905;

export interface DobSelectProps {
  /** `YYYY-MM-DD`, or "" while incomplete. */
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

function parse(value: string): { year: string; month: string; day: string } {
  const [year = "", month = "", day = ""] = value.split("-");
  return { year, month, day };
}

export function DobSelect({ value, onChange, error }: DobSelectProps) {
  const t = useTranslations("auth");
  const format = useFormatter();
  const errorId = useId();

  /**
   * The three parts are held here, not derived from `value`.
   *
   * They cannot be derived: an incomplete date emits "", so reading the parts
   * back out of `value` would erase whatever was picked first and the date could
   * never be completed. `value` is still the source of truth once complete —
   * a reset or a prefill flows back in through the effect below.
   */
  const [parts, setParts] = useState(() => parse(value));

  // Adjusting state during render (React's documented pattern) rather than in an
  // effect: an effect would render once with stale parts and then re-render.
  // Only a *complete* value syncs back — "" is our own "still picking" signal and
  // must not wipe the parts mid-selection.
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    if (value) setParts(parse(value));
  }

  const { year, month, day } = parts;

  const thisYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({ length: thisYear - OLDEST_YEAR + 1 }, (_, i) => String(thisYear - i)),
    [thisYear],
  );

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: String(i + 1).padStart(2, "0"),
        // Localised month names, so the picker reads naturally in en / ru / tg.
        label: format.dateTime(new Date(2000, i, 1), { month: "long" }),
      })),
    [format],
  );

  /** Clamps to the real length of the chosen month (Feb 29 only in leap years). */
  const daysInMonth = year && month ? new Date(Number(year), Number(month), 0).getDate() : 31;

  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, "0")),
    [daysInMonth],
  );

  const emit = (next: Partial<typeof parts>) => {
    const merged = { ...parts, ...next };

    // Shortening a month under a picked day (31 → Feb) must not emit Feb 31.
    const max =
      merged.year && merged.month
        ? new Date(Number(merged.year), Number(merged.month), 0).getDate()
        : 31;
    if (Number(merged.day) > max) merged.day = String(max).padStart(2, "0");

    setParts(merged);

    const complete = merged.year && merged.month && merged.day;
    onChange(complete ? `${merged.year}-${merged.month}-${merged.day}` : "");
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-4">
        <DobDropdown
          label={t("day")}
          value={day}
          onChange={(next) => emit({ day: next })}
          options={days.map((d) => ({ value: d, label: String(Number(d)) }))}
          invalid={Boolean(error)}
        />
        <DobDropdown
          label={t("month")}
          value={month}
          onChange={(next) => emit({ month: next })}
          options={months}
          invalid={Boolean(error)}
        />
        <DobDropdown
          label={t("year")}
          value={year}
          onChange={(next) => emit({ year: next })}
          options={years.map((y) => ({ value: y, label: y }))}
          invalid={Boolean(error)}
        />
      </div>

      {error ? (
        <p id={errorId} className="text-ig-danger mt-1.5 px-1 text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function DobDropdown({
  label,
  value,
  onChange,
  options,
  invalid,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  invalid: boolean;
}) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        aria-invalid={invalid}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "border-auth-input-border bg-auth-input-bg h-15 w-full appearance-none rounded-xl border pr-10 pl-4 text-[15px]",
          "focus:border-auth-input-border-focus cursor-pointer transition-colors outline-none",
          value ? "text-ig-text" : "text-ig-text-secondary",
          invalid && "border-ig-danger focus:border-ig-danger",
        )}
      >
        <option value="" disabled>
          {label}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-ig-text bg-auth-input-bg">
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown className="text-ig-text pointer-events-none absolute inset-y-0 right-3 my-auto size-5" />
    </div>
  );
}
