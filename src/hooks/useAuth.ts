"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { type ApiError } from "@/lib/axios";
import { ROUTES } from "@/lib/constants";
import { accountService } from "@/services/account.service";
import { useAuthStore } from "@/store/auth.store";
import type { LoginDto, RegisterDto, SessionUser } from "@/types/auth.types";

/**
 * Hands the freshly-issued JWT to the server, which stores it in an httpOnly
 * cookie and returns only the claims. This is the single moment the token is in
 * client memory — it is never persisted there.
 */
async function persistSession(token: string): Promise<SessionUser | null> {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  if (!res.ok) return null;
  const data: { user: SessionUser | null } = await res.json();
  return data.user;
}

export function useAuth() {
  const router = useRouter();
  const t = useTranslations("errors");
  const { user, isAuth, isReady, setUser } = useAuthStore();

  const login = useMutation({
    mutationFn: async (dto: LoginDto) => {
      const token = await accountService.login(dto);
      return persistSession(token);
    },
    onSuccess: (sessionUser) => {
      setUser(sessionUser);
      router.replace(ROUTES.home);
      router.refresh();
    },
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });

  const register = useMutation({
    mutationFn: (dto: RegisterDto) => accountService.register(dto),
    onSuccess: () => router.push(ROUTES.login),
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });

  const logout = async () => {
    await fetch("/api/auth/session", { method: "DELETE" });
    setUser(null);
    router.replace(ROUTES.login);
    router.refresh();
  };

  return { user, isAuth, isReady, login, register, logout };
}
