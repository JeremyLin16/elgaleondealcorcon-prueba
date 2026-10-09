import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Spanish is the site's language; English is a faithful translation.
  locales: ["es", "en"],
  defaultLocale: "es",
  // "as-needed": Spanish has no prefix ("/", "/aviso-legal") and English does
  // ("/en", "/en/legal-notice"). The Spanish URLs are exactly the ones the
  // previous site had, so they keep their rankings.
  localePrefix: "as-needed",
  // Never redirect by browser language: Google crawls without
  // Accept-Language and advises against it, and visitors who want the other
  // language use the switcher in the header.
  localeDetection: false,
  // No NEXT_LOCALE cookie: the privacy policy states the site uses no
  // cookies, and without locale detection the cookie would be useless anyway.
  localeCookie: false,
  // No hreflang "Link" response header: the <link rel="alternate"> tags from
  // lib/seo.ts are the single source. The header would repeat them using the
  // request host (workers.dev on previews) and would also be sent on 404s.
  alternateLinks: false,
  // Internal path (the folder under app/[locale]/, Spanish) -> public URL per
  // language. Links and metadata always use the internal path; next-intl
  // translates it. A new page needs an entry here (see README "Adding a page").
  pathnames: {
    "/": "/",
    "/aviso-legal": { es: "/aviso-legal", en: "/legal-notice" },
    "/privacidad": { es: "/privacidad", en: "/privacy" },
  },
});

export type Locale = (typeof routing.locales)[number];

/** Internal path of a page: a key of routing.pathnames. */
export type AppPathname = keyof typeof routing.pathnames;

/** Internal path of the 404 page (app/[locale]/not-found-page); see middleware.ts. */
export const NOT_FOUND_PATH = "/not-found-page";
