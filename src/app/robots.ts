import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

/** Everything behind the auth guard is private — only public entry points are crawlable. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/login", "/register"],
      disallow: ["/", "/api/", "/chat", "/settings", "/profile", "/post", "/stories"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
