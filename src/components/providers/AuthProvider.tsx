"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useSavedAccountsStore } from "@/store/savedAccounts.store";
import type { SessionUser } from "@/types/auth.types";

/**
 * Asks the server who is logged in. The response carries the user only — both
 * tokens stay in httpOnly cookies.
 *
 * A restored session also refreshes the browser's saved-account list, so an
 * account that was already signed in before this feature existed still appears
 * on the "Continue as …" screen after logging out — without it, only a *fresh*
 * login would ever fill that list.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const remember = useSavedAccountsStore((s) => s.remember);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch("/api/auth/session");
        const data: { user: SessionUser | null } = await res.json();
        if (cancelled) return;

        setUser(data.user);
        if (!data.user) return;

        // The avatar rides along on the session response now — no extra request.
        remember({
          userId: data.user.id,
          userName: data.user.userName,
          image: data.user.avatarUrl ?? null,
        });
      } catch {
        if (!cancelled) setUser(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setUser, remember]);

  return children;
}
