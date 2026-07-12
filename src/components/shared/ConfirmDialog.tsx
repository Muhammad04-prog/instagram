"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Instagram-style confirm sheet: stacked full-width rows, destructive action
 * first and separated by hairlines (see docs/screenshots/img34.png).
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = true,
  warnDescription = false,
  onConfirm,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  /** Renders the description in the danger colour — for irreversible side effects. */
  warnDescription?: boolean;
  onConfirm: () => void;
}) {
  const t = useTranslations("common");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent
        showCloseButton={false}
        className="bg-ig-elevated w-[400px] gap-0 overflow-hidden rounded-xl p-0"
      >
        <div className="px-6 pt-8 pb-6 text-center">
          <DialogTitle className="text-ig-text text-xl font-normal">{title}</DialogTitle>
          {description ? (
            <DialogDescription
              className={cn(
                "mt-2 text-sm",
                warnDescription ? "text-ig-danger font-medium" : "text-ig-text-secondary",
              )}
            >
              {description}
            </DialogDescription>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => {
            onConfirm();
            onOpenChange?.(false);
          }}
          className={cn(
            "border-ig-separator hover:bg-ig-bg-secondary w-full border-t py-3.5 text-sm font-bold",
            destructive ? "text-ig-danger" : "text-ig-primary",
          )}
        >
          {confirmLabel}
        </button>

        <button
          type="button"
          onClick={() => onOpenChange?.(false)}
          className="border-ig-separator text-ig-text hover:bg-ig-bg-secondary w-full border-t py-3.5 text-sm"
        >
          {cancelLabel ?? t("cancel")}
        </button>
      </DialogContent>
    </Dialog>
  );
}
