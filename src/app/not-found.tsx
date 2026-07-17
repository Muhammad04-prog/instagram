import Link from "next/link";

/**
 * 404 for requests that never reach the `[locale]` segment (unmatched top-level
 * paths, and the built-in `/_not-found` route). The root layout only forwards
 * children, so this page must supply the document tags itself.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-white text-center text-black">
        <h1 className="text-[22px] font-light">Sorry, this page isn&apos;t available.</h1>
        <p className="max-w-sm text-sm text-[#737373]">
          The link you followed may be broken, or the page may have been removed.
        </p>
        <Link href="/" className="text-sm font-semibold text-[#0095f6]">
          Go back to Instagram.
        </Link>
      </body>
    </html>
  );
}
