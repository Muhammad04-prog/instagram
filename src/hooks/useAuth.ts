"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useApiError } from "@/hooks/useApiError";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { useSavedAccountsStore } from "@/store/savedAccounts.store";
import type { LoginDto, RegisterDto, TokensDto } from "@/types/api.types";
import type { SessionUser } from "@/types/auth.types";

type LoginResult =
  | { twoFactorRequired: false; user: SessionUser | null }
  | { twoFactorRequired: true; ticket: string };

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
  const t = useTranslations("auth");
  const toMessage = useApiError();
  const { user, isAuth, isReady, setUser } = useAuthStore();
  const remember = useSavedAccountsStore((s) => s.remember);

  // Named once so `verifyTwoFactor` doesn't repeat "persist + remember + go home".
  const finishLogin = async (tokens: TokensDto): Promise<SessionUser | null> => {
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
  };

  /**
   * `POST /auth/login` answers either real tokens or — undocumented in
   * Swagger, see `TwoFactorRequiredDto` — a `{ ticket }` for a 2FA account.
   * Discriminated on `"ticket" in result`, not a flag name, since that field
   * is the one thing `Verify2faDto` actually consumes.
   */
  const login = useMutation({
    mutationFn: async (dto: LoginDto): Promise<LoginResult> => {
      const result = await authService.login(dto);
      if ("ticket" in result) return { twoFactorRequired: true, ticket: result.ticket };

      const sessionUser = await finishLogin(result);
      return { twoFactorRequired: false, user: sessionUser };
    },
    onSuccess: (result) => {
      if (result.twoFactorRequired) return; // LoginForm shows the code step next.
      setUser(result.user);
      router.replace(ROUTES.home);
      router.refresh();
    },
    // 401 here means wrong password / no such account — the backend is explicit
    // that this is a 401 and not a 500, so it is safe to say so plainly.
    onError: (error) => toast.error(toMessage(error, { 401: t("invalidCredentials") })),
  });

  /** Second step: ticket + authenticator/backup code → real tokens. */
  const verifyTwoFactor = useMutation({
    mutationFn: async (vars: { ticket: string; code: string }) => {
      const tokens = await authService.verify2fa(vars);
      return finishLogin(tokens);
    },
    onSuccess: (sessionUser) => {
      setUser(sessionUser);
      router.replace(ROUTES.home);
      router.refresh();
    },
    onError: (error) => toast.error(toMessage(error, { 401: t("invalid2faCode") })),
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
    // 409 = userName / email / phone already taken.
    onError: (error) => toast.error(toMessage(error, { 409: t("accountTaken") })),
  });

  const logout = async () => {
    // The session route revokes the refresh token upstream before clearing.
    await fetch("/api/auth/session", { method: "DELETE" });
    setUser(null);
    router.replace(ROUTES.login);
    router.refresh();
  };

  return { user, isAuth, isReady, login, register, logout, verifyTwoFactor };
}
