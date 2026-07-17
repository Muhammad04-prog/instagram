import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { API_URL } from "@/lib/constants";

/**
 * NextAuth (Auth.js v5) on top of our own NestJS auth.
 *
 * The backend — not NextAuth — remains the identity authority: it hashes
 * passwords, issues the access/refresh pair and rotates it (reusing a revoked
 * refresh kills every session). NextAuth is only the *session layer* for
 * Next.js, so the provider is `Credentials`: it forwards login+password to
 * `POST /auth/login` and treats a returned pair as proof of identity.
 *
 * Why JWT strategy and not a database session: our sessions already live in the
 * backend's `RefreshToken` table. A NextAuth adapter would mean a second,
 * competing session store in the same app — two sources of truth for "is this
 * user still logged in". Credentials providers also cannot use database
 * sessions cleanly. Revocation still works: the moment the backend rejects the
 * refresh token, this token stops renewing and the session dies.
 *
 * The access token is deliberately NOT exposed in `session`. `useSession()`
 * hands the session object to client-side JS, and this app's rule is that
 * nothing token-shaped ever reaches the browser (see `lib/auth-tokens.ts` —
 * httpOnly cookies + the proxy). The token stays inside the encrypted JWT
 * cookie, readable only on the server via `auth()`.
 */

/** Mirrors `AuthUserDto` — what `/auth/login` and `/auth/refresh` both return. */
interface BackendUser {
  id: string;
  userName: string;
  fullName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  role?: string | null;
  isVerified?: boolean | null;
}

interface LoginEnvelope {
  data?: {
    accessToken?: string;
    refreshToken?: string;
    user?: BackendUser;
  } | null;
  errors?: string[] | null;
}

/** Skew so we refresh slightly early instead of racing the expiry. */
const EXPIRY_SKEW_MS = 30_000;

/**
 * The backend does not return `expiresIn`, so we read `exp` out of the access
 * token itself. Falls back to "already expired" — a wrong-but-early refresh is
 * harmless, whereas assuming a long life would hand out dead tokens.
 */
function accessTokenExpiry(accessToken: string): number {
  const payload = accessToken.split(".")[1];
  if (!payload) return 0;
  try {
    const json = JSON.parse(Buffer.from(payload, "base64url").toString()) as { exp?: number };
    return typeof json.exp === "number" ? json.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

async function postJson<T>(path: string, body: unknown): Promise<{ ok: boolean; json: T }> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  return { ok: res.ok, json: (await res.json().catch(() => null)) as T };
}

export const authConfig = {
  /**
   * Not the default /api/auth: this app already owns `api/auth/session`, and a
   * static route beats a catch-all in Next's router — NextAuth's own session
   * endpoint would be shadowed by it. Moving the basePath keeps both intact.
   */
  basePath: "/api/nextauth",
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        login: { label: "Username, email or phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      /**
       * Returning an object = authenticated, `null` = rejected. We never decide
       * that ourselves: the backend does, and a 401 simply becomes null.
       */
      async authorize(credentials) {
        const login = credentials?.login;
        const password = credentials?.password;
        if (typeof login !== "string" || typeof password !== "string") return null;

        const { ok, json } = await postJson<LoginEnvelope>("/auth/login", { login, password });
        const data = json?.data;
        if (!ok || !data?.accessToken || !data.refreshToken || !data.user) return null;

        return {
          id: data.user.id,
          name: data.user.fullName ?? data.user.userName,
          email: data.user.email ?? null,
          image: data.user.avatarUrl ?? null,
          userName: data.user.userName,
          role: data.user.role ?? "USER",
          isVerified: data.user.isVerified ?? false,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        };
      },
    }),
  ],
  callbacks: {
    /**
     * Runs on sign-in (`user` present) and on every later read of the session.
     * Sign-in seeds the pair; later calls renew it when the access token is
     * about to expire — the backend rotates refresh tokens, so we must store
     * the NEW refresh token it returns, otherwise the next renewal would replay
     * a revoked one and the backend would (correctly) kill every session.
     */
    async jwt({ token, user }) {
      if (user) {
        const u = user as typeof user & {
          userName?: string;
          role?: string;
          isVerified?: boolean;
          accessToken?: string;
          refreshToken?: string;
        };
        token.userId = u.id as string;
        token.userName = u.userName;
        token.role = u.role;
        token.isVerified = u.isVerified;
        token.accessToken = u.accessToken;
        token.refreshToken = u.refreshToken;
        token.accessTokenExpires = u.accessToken ? accessTokenExpiry(u.accessToken) : 0;
        return token;
      }

      const expires = typeof token.accessTokenExpires === "number" ? token.accessTokenExpires : 0;
      if (Date.now() < expires - EXPIRY_SKEW_MS) return token;
      if (typeof token.refreshToken !== "string") return { ...token, error: "NoRefreshToken" };

      const { ok, json } = await postJson<LoginEnvelope>("/auth/refresh", {
        refreshToken: token.refreshToken,
      });
      const data = json?.data;
      if (!ok || !data?.accessToken || !data.refreshToken) {
        // Refresh rejected (revoked, reused, expired) — mark the session dead
        // instead of silently keeping a token that no longer opens anything.
        return { ...token, error: "RefreshFailed" };
      }

      // `/auth/refresh` returns the user again, so re-read `role` here rather
      // than trusting the copy made at sign-in. This is the standard JWT
      // staleness problem — a token carries a snapshot, and a demoted admin
      // would otherwise keep an ADMIN token until it expired. It is not a full
      // fix (the window is one access-token lifetime, 15 min), but it is the
      // only revocation point a stateless session has.
      return {
        ...token,
        userName: data.user?.userName ?? token.userName,
        role: data.user?.role ?? token.role,
        isVerified: data.user?.isVerified ?? token.isVerified,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        accessTokenExpires: accessTokenExpiry(data.accessToken),
        error: undefined,
      };
    },

    /**
     * Token → what the app is allowed to see. Note what is NOT copied across:
     * accessToken and refreshToken stay in the server-side token only.
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.userId as string) ?? "";
        session.user.userName = token.userName as string | undefined;
        // Safe to expose: `role` and `isVerified` are not secrets, and the UI
        // gates on them (admin panel, blue tick). They are a hint for *drawing*,
        // never the authority — every admin endpoint checks the role server-side
        // too, and a forged session would still get 403 from the backend.
        session.user.role = token.role as string | undefined;
        session.user.isVerified = token.isVerified as boolean | undefined;
      }
      session.error = token.error as string | undefined;
      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
