"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAccessibilityStore } from "@/store/accessibility.store";

export function Providers({ children }: { children: ReactNode }) {
  const reduceMotion = useAccessibilityStore((s) => s.reduceMotion);

  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <TooltipProvider delayDuration={200}>
            <MotionConfig reducedMotion={reduceMotion ? "always" : "never"}>
              {children}
              <Toaster position="bottom-center" richColors closeButton />
            </MotionConfig>
          </TooltipProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
