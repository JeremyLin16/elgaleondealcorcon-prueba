import type { MetadataRoute } from "next";
import { IS_INDEXABLE } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

// Served at /robots.txt. Preview builds block everything (see next.config.ts).
// Pages that must stay out of Google use noindex metadata instead of a
// Disallow here: a disallowed page can't be crawled, so Google never sees
// its noindex and may still list the bare URL.
export default function robots(): MetadataRoute.Robots {
  if (!IS_INDEXABLE) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
