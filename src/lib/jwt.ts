import type { JwtPayload } from "@/types/auth.types";

/**
 * Reads the JWT claims without verifying the signature — the backend is the only
 * authority. We decode purely to know *when the token dies*, so the proxy can
 * renew it before spending a request on a 401. Identity comes from
 * `GET /auth/me`, never from parsing the token.
 */
export function decodeJwt(token: string): JwtPayload | null {
  const payload = token.split(".")[1];
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof window === "undefined"
        ? Buffer.from(normalized, "base64").toString("utf8")
        : decodeURIComponent(
            atob(normalized)
              .split("")
              .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
              .join(""),
          );

    const claims: unknown = JSON.parse(json);
    if (typeof claims !== "object" || claims === null) return null;

    const record = claims as Record<string, unknown>;

    return {
      sub: typeof record.sub === "string" ? record.sub : "",
      exp: typeof record.exp === "number" ? record.exp : 0,
    };
  } catch {
    return null;
  }
}

/** Seconds of remaining life below which we renew rather than risk a 401 mid-flight. */
const EXPIRY_SKEW_S = 30;

/**
 * True when the token is missing, unreadable, expired, or about to expire.
 *
 * An unreadable token counts as expiring, so the caller falls back to the
 * refresh token instead of confidently sending garbage upstream.
 */
export function isExpiring(payload: JwtPayload | null): boolean {
  if (!payload || payload.exp <= 0) return true;
  return payload.exp * 1000 - EXPIRY_SKEW_S * 1000 <= Date.now();
}
