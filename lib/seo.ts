import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getPathname } from "@/i18n/navigation";
import { routing, type AppPathname, type Locale } from "@/i18n/routing";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "./site";

// false on preview builds (see next.config.ts). Value inlined at build time.
export const IS_INDEXABLE = process.env.SEO_INDEXABLE !== "false";

const toLocale = (locale: string): Locale => (hasLocale(routing.locales, locale) ? locale : routing.defaultLocale);

/**
 * Absolute public URL of a page in a locale. `path` is the internal path (a
 * key of routing.pathnames: "/", "/aviso-legal"...); next-intl turns it into
 * that locale's public URL ("/en/legal-notice"), the same way <Link> does, so
 * canonical, hreflang, sitemap and links can never disagree.
 */
export function localizedUrl(locale: string, path: AppPathname): string {
  const pathname = getPathname({ locale: toLocale(locale), href: path });
  // Home page of the default locale: the bare origin, without a trailing slash.
  return pathname === "/" ? SITE_URL : `${SITE_URL}${pathname}`;
}

/** hreflang map for a page: one entry per locale plus x-default. */
export function languageAlternates(path: AppPathname): Record<string, string> {
  return {
    ...Object.fromEntries(routing.locales.map((locale) => [locale, localizedUrl(locale, path)])),
    "x-default": localizedUrl(routing.defaultLocale, path),
  };
}

// Open Graph locale per language (one entry per locale in i18n/routing.ts).
const OG_LOCALE: Record<Locale, string> = { es: "es_ES", en: "en_GB" };

export interface PageMetadataInput {
  locale: string;
  /** Internal path, a key of routing.pathnames: "/" (home), "/aviso-legal"... */
  path: AppPathname;
  /** ~50-60 characters, unique per page, most important words first. */
  title: string;
  /** ~120-160 characters, unique per page. */
  description?: string;
  /** Link-preview image inside public/, 1200x630. */
  image?: string;
  /** true: use the title as is, without the " | Site" template suffix. */
  absoluteTitle?: boolean;
  /** true: keep this page out of search results (links are still followed). */
  noindex?: boolean;
}

/**
 * Metadata for every page: title, description, canonical, hreflang, Open
 * Graph, Twitter and robots. Every page.tsx must export a generateMetadata
 * that returns this. Next replaces (does not merge) openGraph when a page
 * sets it, which is why all of it lives in one place instead of layout + page.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  image = DEFAULT_OG_IMAGE,
  absoluteTitle = false,
  noindex = false,
}: PageMetadataInput): Metadata {
  const url = localizedUrl(locale, path);
  const images = [{ url: image, width: 1200, height: 630 }];
  // The layout's title template (" | El Galeón de Alcorcón") only applies to
  // <title>; link previews (WhatsApp, Facebook) need the full title too, or a
  // shared legal page shows just "Aviso legal".
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    ...((noindex || !IS_INDEXABLE) && { robots: { index: false, follow: true } }),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      url,
      title: fullTitle,
      description,
      locale: OG_LOCALE[toLocale(locale)],
      alternateLocale: routing.locales.filter((l) => l !== toLocale(locale)).map((l) => OG_LOCALE[l]),
      images,
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images },
  };
}

/**
 * Metadata for the 404 page, the one page without pageMetadata(): it has no
 * URL of its own, so no canonical, hreflang or Open Graph URL; noindex because
 * it is served for every unknown URL (with status 404, see middleware.ts).
 */
export function notFoundMetadata({ title, description }: { title: string; description: string }): Metadata {
  return { title, description, robots: { index: false, follow: true } };
}
