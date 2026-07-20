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
import type { SessionDto } from "@/types/api.types";

/**
 * `GET /auth/sessions?rt=<refresh>` — the query param is what marks *this*
 * session `current`. The refresh token never reaches client JS (that is the
 * whole point of the httpOnly cookie), so this can't go through the generic
 * `/api/proxy` passthrough like every other endpoint: only this dedicated
 * route ever sees the real value, reads it straight from the cookie, and
 * hands the backend only what it asked for.
 */
export async function GET() {
  const refresh = await readRefreshToken();
  if (!refresh) return NextResponse.json([]);

  let access = await readAccessToken();
  if (!access || isExpiring(decodeJwt(access))) {
    const tokens = await refreshTokens(refresh);
    if (!tokens) {
      await clearTokens();
      return NextResponse.json([]);
    }
    await storeTokens(tokens);
    access = tokens.accessToken;
  }

  try {
    const response = await fetch(`${API_URL}/auth/sessions?rt=${encodeURIComponent(refresh)}`, {
      headers: { Authorization: `Bearer ${access}` },
      cache: "no-store",
    });

    if (!response.ok) return NextResponse.json([]);

    const payload: unknown = await response.json();
    const sessions = (payload as { data?: SessionDto[] } | null)?.data;
    return NextResponse.json(sessions ?? []);
  } catch {
    return NextResponse.json([]);
  }
}
