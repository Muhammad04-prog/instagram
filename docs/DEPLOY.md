# Deploy

## ⚠️ `.env` is not deployed

`.gitignore` ignores `.env*`, and no env file is tracked in git. The local
`.env` configures `npm run dev` **only** — it never reaches the server. Every
variable below has to be entered in the hosting dashboard (Vercel → Settings →
Environment Variables, Render → Environment, …), or the deployed build runs with
defaults and signs nobody in.

## Variables

| Variable               | Required | Notes                                                                                     |
| ---------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `AUTH_SECRET`          | **yes**  | `npx auth secret`. A fresh one per environment. Missing ⇒ `MissingSecret` on every login. |
| `AUTH_TRUST_HOST`      | **yes**  | `true`. Auth.js is behind the host's proxy; without it callbacks 500 on the public URL.   |
| `NEXT_PUBLIC_API_URL`  | no\*     | `https://backend-instagram-a4k6.onrender.com/api`. Falls back to this in `constants.ts`.  |
| `NEXT_PUBLIC_SITE_URL` | **yes**  | The deployed origin. Defaults to `http://localhost:3000` — wrong on a public site.        |

\* It boots without it, but set it so the deployed build is explicit rather than
relying on a fallback someone may later change.

`NEXT_PUBLIC_*` are inlined **at build time**, not read at runtime: changing
either one requires a redeploy, not just a restart.

## Checklist

1. Set the four variables above in the host dashboard, for the production
   environment.
2. Point `NEXT_PUBLIC_SITE_URL` at the real domain (no trailing slash).
3. If media starts coming back from a new storage host, add it to
   `remotePatterns` in `next.config.ts` — `<Image>` refuses any host not listed,
   and the failure looks like broken avatars rather than an error.
4. `npm run build` locally first; the same build runs on the host.

## Token handling (already correct, don't "fix" it)

The JWT lives in an httpOnly cookie and is attached server-side in
`src/app/api/proxy/[...path]/route.ts`. It is never exposed to client JS. The
cookie sets `secure` from `NODE_ENV === "production"` (`src/lib/auth-tokens.ts`),
so it is HTTPS-only once deployed — which means **the deployed site must be
served over HTTPS** or login will appear to succeed and then immediately drop.
