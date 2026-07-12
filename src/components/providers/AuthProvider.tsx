"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/store/auth.store";
import type { SessionUser } from "@/types/auth.types";

/**
 * Asks the server who is logged in. The response carries claims only — the JWT
 * stays in the httpOnly cookie.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch("/api/auth/session");
        const data: { user: SessionUser | null } = await res.json();
        if (!cancelled) setUser(data.user);
      } catch {
        if (!cancelled) setUser(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setUser]);

  return children;
}
