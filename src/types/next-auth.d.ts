import type { DefaultSession } from "next-auth";

/**
 * Module augmentation for NextAuth.
 *
 * Without it TypeScript knows only NextAuth's default shape (name/email/image),
 * and every custom field we put on the token or session — `userId`, `userName`,
 * the token pair — would be a type error at the point of use.
 *
 * Note the asymmetry, and that it is deliberate: `accessToken`/`refreshToken`
 * exist on JWT (server-side, inside the encrypted cookie) but NOT on Session.
 * `useSession()` exposes the session to client-side JS, and no token is allowed
 * to reach the browser in this app.
 */

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      userName?: string;
      /** `USER` | `ADMIN` — what the admin panel gates on. Drawing only: the
       *  backend re-checks it on every admin endpoint. */
      role?: string;
      isVerified?: boolean;
    } & DefaultSession["user"];
    /** Set when refresh failed — the UI should treat the session as dead. */
    error?: string;
  }

  interface User {
    userName?: string;
    role?: string;
    isVerified?: boolean;
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    userName?: string;
    role?: string;
    isVerified?: boolean;
    /** Server-side only. Never copied into Session. */
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}
