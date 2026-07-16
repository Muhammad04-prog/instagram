import { NextResponse } from "next/server";
import {
  clearTokens,
  readAccessToken,
  readRefreshToken,
  refreshTokens,
  storeTokens,
} from "@/lib/auth-tokens";
import { API_URL } from "@/lib/constants";
import { decodeJwt, isExpiring } from "@/lib/jwt";
import type { AuthUserDto, TokensDto } from "@/types/api.types";

/**
 * Session endpoint — the browser's only window onto who is logged in.
 *
 * It hands back the user, never a token: both tokens stay in httpOnly cookies
 * that only the server reads.
 *
 * Identity is asked of the backend (`GET /auth/me`) rather than decoded out of
 * the JWT. That keeps us honest about fields the UI gates on (`role`,
 * `isVerified`, `isPrivate`) — they reflect the account as it is now, not as it
 * was when the token was minted.
 */

async function fetchMe(accessToken: string): Promise<AuthUserDto | null> {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const payload: unknown = await response.json();
    const data = (payload as { data?: { user?: AuthUserDto } | AuthUserDto } | null)?.data;
    if (!data) return null;

    // `/auth/me` is documented as "current user + profile"; accept either the
    // bare user or a { user, profile } envelope until the DB is up to confirm.
    const user = "user" in data ? data.user : (data as AuthUserDto);
    return user?.id ? user : null;
  } catch {
    return null;
  }
}

/** Returns who is logged in — never the JWT. */
export async function GET() {
  const access = await readAccessToken();
  const refresh = await readRefreshToken();

  if (!access && !refresh) return NextResponse.json({ user: null });

  let token = access;

  if (!token || isExpiring(decodeJwt(token))) {
    if (!refresh) {
      await clearTokens();
      return NextResponse.json({ user: null });
    }

    const tokens = await refreshTokens(refresh);
    if (!tokens) {
      await clearTokens();
      return NextResponse.json({ user: null });
    }

    await storeTokens(tokens);
    token = tokens.accessToken;
  }

  const user = await fetchMe(token);
  if (!user) {
    await clearTokens();
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user });
}

/** Stores the token pair from login/register and hands back only the user. */
export async function POST(request: Request) {
  const body: unknown = await request.json();

  const tokens = body as Partial<TokensDto> | null;
  if (
    !tokens ||
    typeof tokens.accessToken !== "string" ||
    typeof tokens.refreshToken !== "string"
  ) {
    return NextResponse.json({ error: "Invalid tokens" }, { status: 400 });
  }

  const user = tokens.user?.id ? tokens.user : await fetchMe(tokens.accessToken);
  if (!user) {
    return NextResponse.json({ error: "Invalid tokens" }, { status: 400 });
  }

  await storeTokens({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });

  return NextResponse.json({ user });
}

/**
 * Logout. Revokes the refresh token upstream before dropping the cookies — the
 * backend documents this as idempotent, so a failure here is not worth blocking
 * the local logout.
 */
export async function DELETE() {
  const refresh = await readRefreshToken();

  if (refresh) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refresh }),
        cache: "no-store",
      });
    } catch {
      // Network failure must not strand the user in a logged-in UI.
    }
  }

  await clearTokens();
  return NextResponse.json({ ok: true });
}
