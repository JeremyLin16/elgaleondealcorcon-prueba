import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { languageAlternates, localizedUrl } from "@/lib/seo";
import { INDEXED_PATHS } from "@/lib/site";

// Served at /sitemap.xml. One entry per page and language, each with the
// same hreflang alternates (what Google asks for). URLs come from lib/seo.ts,
// the same function that builds the canonical tags, so both always match.
// To add a page: add its path to INDEXED_PATHS in lib/site.ts.
//
// No lastModified: the only date available here is the build time, which
// would mark every page as changed on every deploy. Google ignores a
// lastmod that is not reliable, so an honest absence is better.
export default function sitemap(): MetadataRoute.Sitemap {
  return INDEXED_PATHS.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: localizedUrl(locale, path),
      alternates: { languages: languageAlternates(path) },
    }))
  );
}
