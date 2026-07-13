"use client";

import { useEffect, type ReactNode } from "react";
import { userProfileService } from "@/services/userProfile.service";
import { useAuthStore } from "@/store/auth.store";
import { useSavedAccountsStore } from "@/store/savedAccounts.store";
import type { SessionUser } from "@/types/auth.types";

/**
 * Asks the server who is logged in. The response carries claims only — the JWT
 * stays in the httpOnly cookie.
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

        // The avatar is a nicety; a failure here must not disturb the session.
        const profile = await userProfileService.getMyProfile().catch(() => null);
        if (cancelled) return;

        remember({
          userId: data.user.userId,
          userName: data.user.userName,
          image: profile?.image ?? null,
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
