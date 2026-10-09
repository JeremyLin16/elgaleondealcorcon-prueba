import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Only the production branch may be indexed by search engines. Every other
// build (preview branches, PR builds) gets robots.txt "Disallow: /" and a
// noindex meta tag, so preview URLs never compete with the real site.
//
// Cloudflare Workers Builds sets WORKERS_CI_BRANCH (Pages: CF_PAGES_BRANCH).
// Local builds have neither and are treated as production. SEO_INDEXABLE
// ("true" / "false") overrides everything.
const PRODUCTION_BRANCH = "main";
const ciBranch = process.env.WORKERS_CI_BRANCH ?? process.env.CF_PAGES_BRANCH;
const indexable = process.env.SEO_INDEXABLE
  ? process.env.SEO_INDEXABLE === "true"
  : !ciBranch || ciBranch === PRODUCTION_BRANCH;

// Sent with the pages the Worker renders (pages, 404s, robots.txt,
// sitemap.xml). Not with redirects: neither the /home redirect below nor
// next-intl's redirects carry them on Workers. That is harmless, since a
// redirect has no content to protect and HSTS arrives with the first page.
// Files in public/ and /_next/static are served by Workers Static Assets
// without running the Worker, so public/_headers repeats these for them: keep
// both lists in sync. HSTS is only sent from here: the browser remembers it
// for the whole host after one page, so repeating it on every asset adds
// nothing.
const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // No "X-Powered-By: Next.js": it only advertises the stack.
  poweredByHeader: false,
  // Inlined at build time, so the value is also correct inside the Worker at
  // runtime (where the CI variables no longer exist). Read via lib/seo.ts.
  env: {
    SEO_INDEXABLE: String(indexable),
  },
  // Cloudflare Workers has a tight CPU limit per request; on-the-fly image
  // optimisation exceeds it (error 1102). Ship pre-optimised images instead
  // (webp/avif, right size) — see docs/SEO-CHECKLIST.md "Performance".
  images: {
    unoptimized: true,
  },
  // Permanent redirects for URLs that changed or were removed. Never delete
  // an entry while Search Console still shows traffic to the old URL (keep at
  // least a year). See docs/MIGRATION.md.
  async redirects() {
    return [
      // The previous site served a duplicate of the home page at /home.
      { source: "/home", destination: "/", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default withNextIntl(nextConfig);
