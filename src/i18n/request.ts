import { getRequestConfig } from "next-intl/server";

// Stub for Phase 0 — full routing (en / ru / tg) is set up in Phase 1.
export default getRequestConfig(async () => {
  const locale = "en";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
