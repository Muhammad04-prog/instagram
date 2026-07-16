"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { type ApiError } from "@/lib/axios";
import { ROUTES } from "@/lib/constants";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { useSavedAccountsStore } from "@/store/savedAccounts.store";
import type { LoginDto, RegisterDto, TokensDto } from "@/types/api.types";
import type { SessionUser } from "@/types/auth.types";

/**
 * Hands the freshly-issued token pair to the server, which stores both in
 * httpOnly cookies and returns only the user. This is the single moment a token
 * is in client memory — it is never persisted there.
 */
async function persistSession(tokens: TokensDto): Promise<SessionUser | null> {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tokens),
  });

  if (!res.ok) return null;
  const data: { user: SessionUser | null } = await res.json();
  return data.user;
}

export function useAuth() {
  const router = useRouter();
  const t = useTranslations("errors");
  const { user, isAuth, isReady, setUser } = useAuthStore();
  const remember = useSavedAccountsStore((s) => s.remember);

  const login = useMutation({
    mutationFn: async (dto: LoginDto) => {
      const tokens = await authService.login(dto);
      const sessionUser = await persistSession(tokens);

      // Remember the account in this browser so the next visit can offer
      // "Continue as …". The avatar rides along on the login response now, so
      // this no longer costs an extra profile request.
      if (sessionUser) {
        remember({
          userId: sessionUser.id,
          userName: sessionUser.userName,
          image: sessionUser.avatarUrl ?? null,
        });
      }

      return sessionUser;
    },
    onSuccess: (sessionUser) => {
      setUser(sessionUser);
      router.replace(ROUTES.home);
      router.refresh();
    },
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });

  /** Register signs you straight in — it answers with a token pair, not a bare id. */
  const register = useMutation({
    mutationFn: async (dto: RegisterDto) => {
      const tokens = await authService.register(dto);
      return persistSession(tokens);
    },
    onSuccess: (sessionUser) => {
      setUser(sessionUser);
      router.replace(ROUTES.home);
      router.refresh();
    },
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });

  const logout = async () => {
    // The session route revokes the refresh token upstream before clearing.
    await fetch("/api/auth/session", { method: "DELETE" });
    setUser(null);
    router.replace(ROUTES.login);
    router.refresh();
  };

  return { user, isAuth, isReady, login, register, logout };
}
