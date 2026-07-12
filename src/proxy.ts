import { hasLocale } from "next-intl";
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { ACCESS_TOKEN_COOKIE } from "@/lib/constants";

// Next 16 renamed `middleware.ts` → `proxy.ts`.
const intlProxy = createMiddleware(routing);

const AUTH_PAGES = ["/login", "/register", "/forgot-password", "/reset-password"];

export default function proxy(request: NextRequest) {
  const segments = request.nextUrl.pathname.split("/").filter(Boolean);
  const first = segments[0];
  const localized = hasLocale(routing.locales, first);

  const locale = localized ? first : routing.defaultLocale;
  const prefix = localized ? `/${locale}` : "";
  const path = `/${(localized ? segments.slice(1) : segments).join("/")}`;

  const isAuthPage = AUTH_PAGES.some((page) => path.startsWith(page));
  const hasToken = Boolean(request.cookies.get(ACCESS_TOKEN_COOKIE)?.value);

  if (!hasToken && !isAuthPage) {
    return NextResponse.redirect(new URL(`${prefix}/login`, request.url));
  }

  if (hasToken && isAuthPage) {
    return NextResponse.redirect(new URL(prefix || "/", request.url));
  }

  return intlProxy(request);
}

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
