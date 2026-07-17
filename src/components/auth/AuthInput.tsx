"use client";

import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { forwardRef, useId, useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  /** Filled background (register form, img4) vs transparent (login, img6/img7). */
  filled?: boolean;
}

/**
 * Meta-style auth field: 12px radius, 1px border that brightens on focus,
 * **60px tall**.
 *
 * The height is measured, not guessed: the input band is 74px in img4, img5,
 * img6 and img7 alike, and those shots are DPR 1.25 → 74 / 1.25 ≈ 60 CSS px.
 *
 * Any `type="password"` field gets a show/hide eye on the right, so every
 * password box in the app (login, register, confirm, reset, change) has it
 * without each form wiring its own.
 */
export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(function AuthInput(
  { error, filled = false, className, type, ...props },
  ref,
) {
  const t = useTranslations("auth");
  const errorId = useId();
  const [revealed, setRevealed] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && revealed ? "text" : type;

  return (
    <div className="w-full">
      <div className="relative">
        <input
          ref={ref}
          type={inputType}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "border-auth-input-border text-ig-text placeholder:text-ig-text-secondary h-15 w-full rounded-xl border px-4 text-[15px]",
            "focus:border-auth-input-border-focus transition-colors outline-none",
            filled ? "bg-auth-input-bg" : "bg-transparent",
            isPassword && "pr-12",
            error && "border-ig-danger focus:border-ig-danger",
            className,
          )}
          {...props}
        />

        {isPassword ? (
          <button
            type="button"
            // Keeps focus in the field, so toggling does not fire the form's blur
            // validation or lose the caret position.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setRevealed((shown) => !shown)}
            aria-label={revealed ? t("hidePassword") : t("showPassword")}
            aria-pressed={revealed}
            className="text-ig-text-secondary hover:text-ig-text absolute inset-y-0 right-3 flex items-center transition-colors"
          >
            {revealed ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        ) : null}
      </div>

      {error ? (
        <p id={errorId} className="text-ig-danger mt-1.5 px-1 text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
});
