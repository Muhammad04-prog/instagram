"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Full-screen overlay used by the @modal parallel route (post / story).
 * Closing it pops the intercepted route, so the feed underneath stays put.
 */
export function Modal({
  children,
  title,
  className,
}: {
  children: ReactNode;
  title: string;
  className?: string;
}) {
  const router = useRouter();

  return (
    <Dialog defaultOpen onOpenChange={(open) => !open && router.back()}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "max-w-none border-none bg-transparent p-0 shadow-none focus:outline-none",
          className,
        )}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <button
          type="button"
          aria-label="Close"
          onClick={() => router.back()}
          className="fixed top-4 right-4 z-50 text-white/90 transition hover:text-white"
        >
          <X className="size-6" />
        </button>
        {children}
      </DialogContent>
    </Dialog>
  );
}
