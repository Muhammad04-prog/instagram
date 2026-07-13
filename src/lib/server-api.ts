import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, API_URL } from "@/lib/constants";

/**
 * Read-only API call from a Server Component (used by generateMetadata).
 *
 * The browser talks to the API through /api/proxy, but on the server we already
 * hold the httpOnly cookie, so we can call the backend directly. Metadata must
 * never break a page: any failure resolves to `null`.
 */
export async function serverGet<T>(
  path: string,
  params: Record<string, string | number> = {},
): Promise<T | null> {
  try {
    const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    if (!token) return null;

    const url = new URL(`${API_URL}${path}`);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;

    const payload: unknown = await res.json();
    if (payload && typeof payload === "object" && "data" in payload) {
      return (payload as { data: T }).data;
    }
    return payload as T;
  } catch {
    return null;
  }
}
