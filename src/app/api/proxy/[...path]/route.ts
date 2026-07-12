import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE, API_URL } from "@/lib/constants";

/**
 * Server-side gateway to the backend.
 *
 * The JWT lives in an httpOnly cookie and is read *here*, on the server — the
 * browser never sees it, so an XSS cannot steal it. The client calls
 * /api/proxy/<Swagger path> and this handler re-issues the request with the
 * Authorization header attached.
 *
 * Bodies are streamed straight through, so multipart uploads (add-post,
 * send-message, update-user-image-profile) keep their original boundary and are
 * never buffered into memory here.
 */

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

async function forward(request: NextRequest, path: string[]): Promise<Response> {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

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
    } as RequestInit & { duplex?: "half" });
  } catch {
    return NextResponse.json(
      { data: null, errors: ["Upstream request failed"], statusCode: 502 },
      { status: 502 },
    );
  }

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
