import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api"], // "/api" (exact) is the public developer-preview page, not the API routes under it
        // Private, authenticated, or purely functional routes — never
        // useful (or safe) as a search result, and /dashboard is behind
        // real auth regardless. Disallowed here too as defense in
        // depth and to avoid wasting crawl budget on pages that always
        // redirect to /login for a crawler with no session anyway.
        disallow: ["/dashboard", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
