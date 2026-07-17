import { NextResponse, type NextRequest } from "next/server";
import {
  clearTokens,
  readAccessToken,
  readRefreshToken,
  refreshTokens,
  storeTokens,
} from "@/lib/auth-tokens";
import { API_URL } from "@/lib/constants";
import { decodeJwt, isExpiring } from "@/lib/jwt";
import type { TokensDto } from "@/types/api.types";

/**
 * Server-side gateway to the backend.
 *
 * The token pair lives in httpOnly cookies and is read *here*, on the server —
 * the browser never sees it, so an XSS cannot steal it. The client calls
 * /api/proxy/<resource> and this handler re-issues the request upstream with the
 * Authorization header attached.
 *
 * Bodies are streamed straight through, so multipart uploads (posts, stories,
 * avatars, chat files) keep their original boundary and are never buffered here.
 */

/**
 * How long to wait for the backend before giving up.
 *
 * Measured 17.07.2026: a normal request answers in ~0.6s, and Render's free tier
 * cold-starts in ~50s — so this has to clear 50s or the first request after a
 * nap would fail. 90s does, while still cutting off the one path that genuinely
 * hangs: anything writing media waits ~140s on dead storage before erroring.
 * Without a timeout, a request that never comes back never comes back.
 */
const UPSTREAM_TIMEOUT_MS = 90_000;

// Hop-by-hop and host-specific headers must not be forwarded.
const STRIPPED_REQUEST_HEADERS = new Set([
  "host",
  "connection",
  "content-length",
  "accept-encoding",
  "cookie",
]);

const STRIPPED_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
]);

/**
 * Refresh tokens ROTATE: the backend revokes the old one as soon as it issues a
 * new pair. Two requests refreshing the same token in parallel would mean the
 * loser presents an already-revoked token and gets logged out. So refreshes are
 * de-duplicated by token value — concurrent callers await one flight and share
 * its result.
 */
const inFlight = new Map<string, Promise<TokensDto | null>>();

function refreshOnce(refreshToken: string): Promise<TokensDto | null> {
  const existing = inFlight.get(refreshToken);
  if (existing) return existing;

  const flight = refreshTokens(refreshToken).finally(() => {
    inFlight.delete(refreshToken);
  });

  inFlight.set(refreshToken, flight);
  return flight;
}

/**
 * Returns a usable access token, renewing it first when it is expired or about
 * to be. Refreshing up-front (rather than reacting to a 401) is what lets us
 * keep streaming request bodies: a streamed body cannot be replayed, so the
 * request must be right the first time.
 */
async function currentAccessToken(): Promise<string | undefined> {
  const access = await readAccessToken();
  if (access && !isExpiring(decodeJwt(access))) return access;

  const refresh = await readRefreshToken();
  if (!refresh) return access;

  const tokens = await refreshOnce(refresh);
  if (!tokens) {
    await clearTokens();
    return undefined;
  }

  await storeTokens(tokens);
  return tokens.accessToken;
}

async function forward(request: NextRequest, path: string[]): Promise<Response> {
  const token = await currentAccessToken();

  const target = `${API_URL}/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!STRIPPED_REQUEST_HEADERS.has(key.toLowerCase())) headers.set(key, value);
  });
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? request.body : undefined,
      // Required by fetch when streaming a request body.
      ...(hasBody ? { duplex: "half" } : {}),
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    } as RequestInit & { duplex?: "half" });
  } catch (error) {
    // A timeout is not the same failure as a refused connection, and the user
    // deserves to be told which. Anything touching media currently hangs ~140s
    // before the backend gives up on its storage (`/health` → `storage: down`),
    // and without this the request would simply never come back.
    const timedOut = error instanceof DOMException && error.name === "TimeoutError";
    return NextResponse.json(
      {
        data: null,
        errors: [timedOut ? "Upstream timed out" : "Upstream request failed"],
        statusCode: timedOut ? 504 : 502,
      },
      { status: timedOut ? 504 : 502 },
    );
  }

  // A 401 despite a proactively-renewed token means the session is genuinely
  // gone (refresh revoked, account deleted). Drop the cookies so the client
  // stops replaying a dead session.
  if (upstream.status === 401) await clearTokens();

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!STRIPPED_RESPONSE_HEADERS.has(key.toLowerCase())) responseHeaders.set(key, value);
  });

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

type Context = { params: Promise<{ path: string[] }> };

async function handler(request: NextRequest, context: Context): Promise<Response> {
  const { path } = await context.params;
  return forward(request, path);
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;

export const dynamic = "force-dynamic";
