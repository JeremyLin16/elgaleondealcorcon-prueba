# SEO Checklist

The full list, in project order. Items marked **(done)** are already in place in this site's code. Check that they still hold after your changes.

## 0. Decide before writing code

These are expensive to change later: each one changes URLs.

- [ ] **Canonical domain: www or not.** SEO-wise there is no difference; what matters is picking one and redirecting the other.
  - **Existing site:** keep whatever Google indexes today. Search `site:example.com` and look at the URLs.
  - **New site:** no www. It's shorter, and on Cloudflare the old technical reasons for www (CNAME on the apex, CDN) no longer apply.
  - **Exception:** choose www if there will be many subdomains *and* the main site uses cookies or login.
  - Set it in `SITE_URL` (`lib/site.ts`).
- [ ] **Languages and the default language** (`i18n/routing.ts`). The default language has no URL prefix.
- [ ] **Page list and URLs.** Lowercase, words joined with `-`, no IDs or dates, short.
- [ ] **Main search intent per page:** what people type to find it. This drives the title, H1 and description.
- [ ] **Which pages are `noindex`:** legal pages, thank-you pages, internal tools, search results.
- [ ] **Replacing an existing site?** Read [MIGRATION.md](MIGRATION.md) first.

## 1. Code

### Site-wide

- [ ] **(done)** `metadataBase`, title template `%s | Site`, default description: `app/[locale]/layout.tsx`
- [ ] **(done)** `<html lang>` per locale
- [ ] **(done)** Icons `app/icon.png`, `app/apple-icon.png`, `app/favicon.ico`, manifest `app/manifest.ts` with 192/512 px PNG icons, `themeColor` (all from `scripts/images/brand.py` and `lib/theme.ts`)
- [ ] **(done)** `public/og-default.jpg`: 1200×630, < 300 KB

### Every page

- [ ] **(done)** `generateMetadata` → `pageMetadata()`: canonical, hreflang + `x-default`, Open Graph, Twitter
- [ ] Title: ~50–60 chars, unique, most important words first, brand at the end (added by the title template in the layout)
- [ ] Description: ~120–160 chars, unique, says what the visitor gets
- [ ] Dedicated share image (`image:`) for the important pages
- [ ] `noindex: true` on pages that shouldn't be in Google

### Crawling

- [ ] **(done)** `/sitemap.xml` built from `INDEXED_PATHS`, every language, with hreflang alternates (localized URLs)
- [ ] **(done)** `/robots.txt` points to the sitemap
- [ ] **(done)** Preview branches: `Disallow: /` + `noindex` (only the `main` build is indexable)
- [ ] Every indexable page is in `INDEXED_PATHS` and linked from the navigation or another page

### Structured data (JSON-LD)

- [ ] **(done)** Home page: `Organization` (name, url, logo, sameAs) + `WebSite`
- [ ] **(done)** `Restaurant` on the home page, from `restaurant` in `lib/site.ts`: address, phone, hours, geo, cuisine, reservations, menu. Keep it identical to the Google Business Profile.
- [ ] Indexed sub-pages, if any are added: a `BreadcrumbList` builder in `lib/structuredData.ts`
- [ ] If relevant: `Product`, `Article`, `Event`, `Menu`
- [ ] Only describe what's visible on the page
- [ ] Validate: [Rich Results Test](https://search.google.com/test/rich-results), [Schema Validator](https://validator.schema.org)

### Content and HTML

- [ ] One `<h1>` per page that contains the page's main term; headings don't skip levels
- [ ] Important text is in the server-rendered HTML. Check with `curl <url>`: if it isn't in the output, Google may not see it.
- [ ] Key information is not only in images or PDFs (menus, prices, hours)
- [ ] Links are real `<a href>` (`Link` from `@/i18n/navigation`) with descriptive text, never "click here"
- [ ] **(done)** Language switcher uses crawlable links
- [ ] Images have descriptive `alt`; decorative images use `alt=""`

### Performance (Core Web Vitals)

- [ ] Main above-the-fold image: `priority`
- [ ] All images: explicit `width`/`height`, or `fill` + `sizes`, so nothing jumps while loading (CLS)
- [ ] Images pre-optimised (Cloudflare serves them as-is): webp/avif, sized for display, ideally < 300 KB
- [ ] **(done)** Fonts self-hosted by `next/font` (`app/fonts.ts`), `display: "swap"`, latin subset, one weight per family
- [ ] PDFs compressed (a real menu PDF was once 42 MB)
- [ ] `"use client"` only where interactivity is needed
- [ ] **(done)** `/_next/static/*` cached for a year, photos and icons for a week (`public/_headers`)
- [ ] **(done)** Prerendered pages served from the OpenNext cache (`x-opennext-cache: HIT`)

### Routing

- [ ] **(done)** Unknown URLs return a real 404: a server-rendered, localized page (`middleware.ts`)
- [ ] Changed or removed URLs have a permanent redirect (`next.config.ts`). Keep them for at least a year.
- [ ] Every URL redirects at most once (no chains)
- [ ] Consistent trailing slash (Next default: none)

## 2. Cloudflare configuration

Step by step: [DEPLOY-CLOUDFLARE.md](DEPLOY-CLOUDFLARE.md).

- [ ] Worker connected to the GitHub repo (Workers Builds), production branch `main`
- [ ] Builds for non-production branches **disabled**, or accepted knowing they are `noindex`
- [ ] Custom domain on the canonical host
- [ ] Redirect Rule: non-canonical host → canonical, 301, path and query string kept
- [ ] SSL/TLS → **Always Use HTTPS** on
- [ ] `*.workers.dev` route disabled for production once the custom domain works
- [ ] Verification TXT records (Google, Bing) kept in DNS

## 3. Before launch

- [ ] `npm run build && npm start`, then `npm run seo:check -- http://localhost:3000` passes
- [ ] Same check on the deployed Worker URL
- [ ] View the page source of key pages: title, description, canonical, hreflang, og:*, JSON-LD all use the **canonical domain**
- [ ] Rich Results Test on the home page and on business pages
- [ ] Lighthouse (mobile): SEO ≥ 95, Performance ≥ 90, Accessibility ≥ 90
- [ ] Share preview: paste the link into WhatsApp or use opengraph.xyz
- [ ] Visit with an English browser and a Spanish browser (and with `curl`, i.e. no language): every URL serves its own language, with no redirect by browser language

## 4. After launch

- [ ] `npm run seo:check -- https://<canonical-domain>` passes. This also checks the http→https and www/non-www redirects.
- [ ] **Google Search Console**
  - Add a **Domain** property and verify it with a DNS TXT record.
  - Owner = **a company Google account**. Add each team member as an owner too, so access never depends on one person.
  - Submit `https://<canonical-domain>/sitemap.xml`.
  - URL Inspection → **Request indexing** for the home page and the key pages.
- [ ] **Bing Webmaster Tools**: import the site from Search Console (one click). Bing also feeds DuckDuckGo and ChatGPT search.
- [ ] **Google Business Profile** (physical locations):
  - Website link points to the matching page.
  - Name, address and phone are identical to the website and the JSON-LD.
- [ ] Social profiles (Instagram, TikTok, LinkedIn...) link to the site, and are in `organization.sameAs`.
- [ ] Analytics: none on purpose (the privacy policy promises no cookies and no data collection). Use Search Console; adding analytics means updating `/privacidad` first.
- [ ] Search Console → **Pages** report: weekly for the first month, then monthly. Watch for 404s, redirect errors and "Crawled – currently not indexed".

## 5. Ongoing

- [ ] New page → "A new page" in the README
- [ ] URL change → redirect, the same day
- [ ] Business facts change (hours, phone, address) → `lib/site.ts` **and** Google Business Profile
- [ ] Check Core Web Vitals in Search Console every quarter
- [ ] Sitelinks (the sub-results under the main result) are chosen by Google and can't be forced. Clear navigation, distinct page titles and `noindex` on legal pages make the right ones likely.
