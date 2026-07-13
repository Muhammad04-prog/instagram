import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/constants";

/** Only the routes a signed-out visitor can actually open. */
const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.flatMap((locale) =>
    PUBLIC_PATHS.map((path) => ({
      url: `${SITE_URL}${locale === routing.defaultLocale ? "" : `/${locale}`}${path}`,
      lastModified: new Date(),
    })),
  );
}
