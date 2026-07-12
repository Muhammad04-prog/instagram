"use client";

import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  /** Filled background (register form, img4) vs transparent (login, img6/img7). */
  filled?: boolean;
}

/**
 * Meta-style auth field: 12px radius, 1px border that brightens on focus,
 * 56px tall. Sampled from docs/screenshots/img4, img6, img7.
 */
export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(function AuthInput(
  { error, filled = false, className, ...props },
  ref,
) {
  const errorId = useId();

  return (
    <div className="w-full">
      <input
        ref={ref}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "border-auth-input-border text-ig-text placeholder:text-ig-text-secondary h-14 w-full rounded-xl border px-4 text-[15px]",
          "focus:border-auth-input-border-focus transition-colors outline-none",
          filled ? "bg-auth-input-bg" : "bg-transparent",
          error && "border-ig-danger focus:border-ig-danger",
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={errorId} className="text-ig-danger mt-1.5 px-1 text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
});
