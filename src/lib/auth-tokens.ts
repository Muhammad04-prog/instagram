import "server-only";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, API_URL, REFRESH_TOKEN_COOKIE } from "@/lib/constants";
import type { TokensDto } from "@/types/api.types";

/**
 * Server-side custody of the token pair.
 *
 * Both tokens live in httpOnly cookies and are only ever read here and in the
 * proxy — nothing token-shaped is handed to client-side JS.
 */

const ACCESS_MAX_AGE = 60 * 60 * 24; // access token is short-lived
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // refresh survives a month of absence

const baseCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const;

export async function readAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function readRefreshToken(): Promise<string | undefined> {
  return (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value;
}

export async function storeTokens(tokens: Pick<TokensDto, "accessToken" | "refreshToken">) {
  const store = await cookies();
  store.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, { ...baseCookie, maxAge: ACCESS_MAX_AGE });
  store.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, { ...baseCookie, maxAge: REFRESH_MAX_AGE });
}

export async function clearTokens() {
  const store = await cookies();
  store.delete(ACCESS_TOKEN_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
}

/**
 * Spends the refresh token for a fresh pair.
 *
 * The backend rotates refresh tokens, so the old one dies the moment this
 * succeeds — the caller MUST persist the result or the session is lost. Returns
 * null when the refresh token is itself expired or already revoked, which is a
 * real logout, not an error worth retrying.
 */
export async function refreshTokens(refreshToken: string): Promise<TokensDto | null> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (!response.ok) return null;

    const payload: unknown = await response.json();
    const data = (payload as { data?: TokensDto } | null)?.data;

    return data?.accessToken && data.refreshToken ? data : null;
  } catch {
    return null;
  }
}
