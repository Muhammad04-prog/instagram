"use client";

import { useEffect } from "react";

/** Last-resort boundary: it replaces the root layout, so it ships its own <html>. */
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-white text-center text-black">
        <h1 className="text-[22px] font-light">Something went wrong</h1>
        <p className="max-w-sm text-sm text-[#737373]">
          An unexpected error occurred. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-[#0095f6] px-4 py-2 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
