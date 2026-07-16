"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

const LENGTH = 6;

/**
 * Six-box input for the code `forgot-password` mails out.
 *
 * Behaves the way people expect an OTP field to: typing advances, Backspace on
 * an empty box steps back, and pasting the whole code from the email fills every
 * box at once instead of dropping five characters into the first one.
 *
 * `value` is the plain string — the boxes are presentation.
 */
export function CodeInput({
  value,
  onChange,
  error,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoFocus?: boolean;
}) {
  const boxes = useRef<(HTMLInputElement | null)[]>([]);

  const setDigit = (index: number, digit: string) => {
    const next = value.padEnd(LENGTH, " ").split("");
    next[index] = digit || " ";
    onChange(next.join("").replace(/ /g, "").slice(0, LENGTH));
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) return;

    // Fast path: characters land left-to-right, so appending is what the user means.
    const next = (value.slice(0, index) + digit).slice(0, LENGTH);
    onChange(next);
    boxes.current[Math.min(index + 1, LENGTH - 1)]?.focus();
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Backspace") return;

    if (value[index]) {
      setDigit(index, "");
      return;
    }

    // Empty box: step back and clear the previous one.
    event.preventDefault();
    onChange(value.slice(0, Math.max(0, index - 1)));
    boxes.current[Math.max(0, index - 1)]?.focus();
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!digits) return;

    onChange(digits);
    boxes.current[Math.min(digits.length, LENGTH - 1)]?.focus();
  };

  return (
    <div className="w-full">
      <div className="flex justify-between gap-2" dir="ltr">
        {Array.from({ length: LENGTH }, (_, index) => (
          <input
            key={index}
            ref={(node) => {
              boxes.current[index] = node;
            }}
            value={value[index] ?? ""}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            autoFocus={autoFocus && index === 0}
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            aria-label={`${index + 1}`}
            aria-invalid={Boolean(error)}
            maxLength={1}
            className={cn(
              "border-auth-input-border bg-auth-input-bg text-ig-text h-15 w-full rounded-xl border text-center text-[20px] font-semibold",
              "focus:border-auth-input-border-focus transition-colors outline-none",
              error && "border-ig-danger focus:border-ig-danger",
            )}
          />
        ))}
      </div>

      {error ? <p className="text-ig-danger mt-1.5 px-1 text-xs">{error}</p> : null}
    </div>
  );
}
