import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/constants";
import { decodeJwt, isExpired } from "@/lib/jwt";
import type { SessionUser } from "@/types/auth.types";

const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function toSessionUser(token: string): SessionUser | null {
  const payload = decodeJwt(token);
  if (!payload || isExpired(payload)) return null;

  // Non-sensitive claims only. The token itself never leaves the server.
  return {
    userId: payload.sid,
    userName: payload.name,
    email: payload.email,
  };
}

/** Returns who is logged in — never the JWT. */
export async function GET() {
  const store = await cookies();
  const token = store.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) return NextResponse.json({ user: null });

  const user = toSessionUser(token);
  if (!user) {
    store.delete(ACCESS_TOKEN_COOKIE);
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user });
}

/** Stores the JWT in an httpOnly cookie and hands back only the claims. */
export async function POST(request: Request) {
  const body: unknown = await request.json();
  const token =
    typeof body === "object" && body !== null && "token" in body
      ? (body as { token: unknown }).token
      : null;

  if (typeof token !== "string") {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const user = toSessionUser(token);
  if (!user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const store = await cookies();
  store.set(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });

  return NextResponse.json({ user });
}

export async function DELETE() {
  const store = await cookies();
  store.delete(ACCESS_TOKEN_COOKIE);
  return NextResponse.json({ ok: true });
}
