import { handlers } from "@/auth";

/**
 * NextAuth's endpoints, mounted on /api/nextauth — NOT the default /api/auth.
 *
 * The default would collide with this app's existing `api/auth/session`:
 * a static route wins over a catch-all in Next's router, so NextAuth's own
 * /api/auth/session would be shadowed and `useSession()` would silently read
 * the wrong shape. Moving the whole basePath (see `basePath` in `auth.ts`)
 * keeps both session systems intact side by side.
 */
export const { GET, POST } = handlers;
