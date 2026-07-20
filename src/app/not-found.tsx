import Link from "next/link";

/**
 * True-root not-found. `[locale]/layout.tsx` calls `notFound()` when the
 * locale segment doesn't match `routing.locales` — that happens *before* it
 * renders `<html>`/`<body>`, so Next falls back to this boundary, not
 * `[locale]/not-found.tsx` (which only catches notFound() from routes already
 * inside the locale layout). Without this file, Next used its built-in 404
 * under the root layout, which intentionally has no `<html>`/`<body>`
 * (`src/app/layout.tsx`) — hence "Missing <html> and <body> tags in the root
 * layout". Self-contained like `global-error.tsx`: no next-intl provider
 * exists at this level to translate from, so `next/link` is used directly
 * rather than the locale-aware `Link` from `@/i18n/navigation`.
 */
export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-white text-center text-black">
        <h1 className="text-[22px] font-light">Page not found</h1>
        <p className="max-w-sm text-sm text-[#737373]">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="rounded-lg bg-[#0095f6] px-4 py-2 text-sm font-semibold text-white"
        >
          Back home
        </Link>
      </body>
    </html>
  );
}
