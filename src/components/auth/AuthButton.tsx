"use client";

import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "outline";
}

/**
 * Meta-style pill button: #0064E0 enabled, #133B6E when disabled (dark).
 *
 * 44px tall — measured off img5 and img7, where the button band is 55px at
 * DPR 1.25 (55 / 1.25 = 44). Inputs are taller (60px); the buttons really are
 * the shorter of the two on the reference screens.
 */
export function AuthButton({
  loading,
  variant = "primary",
  disabled,
  className,
  children,
  ...props
}: AuthButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={cn(
        "flex h-11 w-full items-center justify-center rounded-full text-[15px] font-semibold transition-colors",
        variant === "primary" && [
          "text-white",
          isDisabled
            ? "bg-auth-primary-disabled cursor-not-allowed"
            : "bg-auth-primary hover:bg-auth-primary-hover",
        ],
        variant === "outline" && [
          "border-auth-primary text-auth-primary border bg-transparent",
          isDisabled ? "cursor-not-allowed opacity-60" : "hover:bg-auth-primary/10",
        ],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-5 animate-spin" /> : children}
    </button>
  );
}
