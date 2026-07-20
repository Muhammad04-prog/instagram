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
import type { LogoutAllResultDto } from "@/types/api.types";

/**
 * `POST /auth/sessions/logout-all` needs the current refresh token in its
 * body (so the backend knows which session to spare) — same reason this
 * can't be a generic `/api/proxy` passthrough as `sessions/route.ts`'s GET.
 */
export async function POST() {
  const refresh = await readRefreshToken();
  if (!refresh) return NextResponse.json({ revoked: 0 } satisfies LogoutAllResultDto);

  let access = await readAccessToken();
  if (!access || isExpiring(decodeJwt(access))) {
    const tokens = await refreshTokens(refresh);
    if (!tokens) {
      await clearTokens();
      return NextResponse.json({ revoked: 0 } satisfies LogoutAllResultDto);
    }
    await storeTokens(tokens);
    access = tokens.accessToken;
  }

  try {
    const response = await fetch(`${API_URL}/auth/sessions/logout-all`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${access}` },
      body: JSON.stringify({ refreshToken: refresh }),
      cache: "no-store",
    });

    if (!response.ok) return NextResponse.json({ revoked: 0 } satisfies LogoutAllResultDto);

    const payload: unknown = await response.json();
    const result = (payload as { data?: LogoutAllResultDto } | null)?.data;
    return NextResponse.json(result ?? { revoked: 0 });
  } catch {
    return NextResponse.json({ revoked: 0 } satisfies LogoutAllResultDto);
  }
}
