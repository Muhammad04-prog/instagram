import type { JwtPayload } from "@/types/auth.types";

/**
 * Reads the JWT claims without verifying the signature — the backend is the
 * only authority; this is purely to know who is logged in on the client.
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
    const sid = record.sid ?? record.nameid ?? record.sub;
    if (typeof sid !== "string") return null;

    return {
      sid,
      name: typeof record.name === "string" ? record.name : "",
      email: typeof record.email === "string" ? record.email : "",
      role: record.role as JwtPayload["role"],
      exp: typeof record.exp === "number" ? record.exp : 0,
    };
  } catch {
    return null;
  }
}

export function isExpired(payload: JwtPayload): boolean {
  return payload.exp > 0 && payload.exp * 1000 <= Date.now();
}
