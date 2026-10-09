# Contributing

Rules for anyone working in this repository: the website of the restaurant El Galeón de Alcorcón. Read [README.md](README.md) for the overview.

## Stack

- Next.js 15 App Router, React 19, TypeScript (strict), Tailwind CSS 3.
- next-intl 4 with `localePrefix: "as-needed"`: Spanish (default) has no URL prefix, English does (`/en/...`).
  - **Localized pathnames** (`pathnames` in `i18n/routing.ts`): every page has an internal path (the Spanish one, also its folder under `app/[locale]/`) and a public URL per language (`/aviso-legal` ↔ `/en/legal-notice`).
  - No locale detection and no locale cookie.
- Deployed to Cloudflare Workers through `@opennextjs/cloudflare`, with the static-assets page cache (`open-next.config.ts`). There is **no** Next.js image optimisation (`images.unoptimized: true`); images must be pre-optimised.

## Commands

```bash
npm run dev                      # dev server
npm run typecheck && npm run lint
npm run check:messages           # es.json and en.json have the same keys
npm run build                    # must pass before any commit
npm start                        # production server on :3000
npm run seo:check -- http://localhost:3000   # SEO smoke test against a running build
npm run preview                  # run on the Workers runtime locally
python3 -I scripts/images/photos.py          # rebuild public/images + lib/images.json
```

## SEO rules (non-negotiable)

These rules protect search rankings. A change that breaks one of them is a bug, even if the page looks fine.

1. **Every `page.tsx` exports `generateMetadata` returning `pageMetadata({...})`** from `lib/seo.ts`. Never hand-write `alternates`, `openGraph` or `robots` in a page. Next replaces `openGraph` wholesale, so partial objects lose fields.
   - The one exception is the 404 page (`app/[locale]/not-found-page`). It has no URL of its own, so it uses `notFoundMetadata()` from the same file.
2. **Never hard-code the domain.** Use `SITE_URL` from `lib/site.ts`, and `localizedUrl(locale, path)` for absolute URLs. Do not move `SITE_URL` to an env variable: when an env variable is missing at build time, the sitemap ends up with URLs like `undefined/...` (this happened on a real project).
3. **Indexable pages are listed in `INDEXED_PATHS`** (`lib/site.ts`, internal paths: `"/"` is the home page); the sitemap is built from it. `noindex` pages (`pageMetadata({ noindex: true })`) must not be in it. Today only the home page is indexed; the legal pages are `noindex`.
4. **Changing or removing a URL requires a permanent redirect** in `next.config.ts` → `redirects()`. Never delete existing redirects.
   - Changing a localized pathname in `i18n/routing.ts` changes a URL too.
   - The Spanish URLs are the previous site's; never change them without a redirect.
5. **One `<h1>` per page.** Headings don't skip levels.
6. **Links use `Link` from `@/i18n/navigation`** (real `<a href>`; adds the locale prefix and translates the path). No `onClick` navigation, no `next/link` directly (ESLint enforces it).
   - `href` is always the internal path: `"/aviso-legal"`, or `{ pathname: "/", hash: anchor("kitchen") }` for a home section. Never write `"/en/legal-notice"` by hand.
   - External links use `components/ExternalLink.tsx` (new tab, `rel="noopener"`).
   - Only exception: the language switcher uses a plain `<a>` with `getPathname()` from the same module (see the comment in `components/LocaleSwitcher.tsx`).
7. **Content is server-rendered.** Text that matters for search must be in the HTML returned by the server: no fetching it client-side, and not only in images or PDFs. Add `"use client"` only to components that need interactivity.
   - Only `clientMessages` in `app/[locale]/layout.tsx` reach the browser: a new client component that calls `useTranslations` needs its namespace added there.
8. **Structured data goes through `lib/structuredData.ts` + `<JsonLd />`**, and must match what's visible on the page. Business facts (address, phone, hours) come from `lib/site.ts`, the same source the UI uses. No price range, ratings, awards or dates the page doesn't show.
9. **Every text exists in every `messages/*.json`**, including `metaTitle` / `metaDescription`. Titles ~50–60 chars, descriptions ~120–160 chars, unique per page and language (`noindex` pages, such as the legal ones, may have shorter titles: they never show in search results). `npm run check:messages` must pass; `seo:check` fails on duplicate titles or descriptions.
10. **Images:**
    - descriptive `alt` in both languages (`alt=""` for decorative images)
    - photos go through `components/Photo.tsx`: `width`/`height` and `srcset` come from `lib/images.json`
    - `priority` on the main above-the-fold image only (the hero)
    - pre-compressed WebP built by `scripts/images/photos.py`, < 300 KB
    - never displayed wider than the largest exported width; no CSS filters or blend modes on photos (bake grading into the files)
11. **Unknown URLs must return 404**, never a 200 page saying "not found".
    - `middleware.ts` rewrites every URL that is not in `routing.pathnames` to the prerendered 404 page with status 404. **A new page must be added to `pathnames`, or it will 404.**
    - `notFound()` still returns 404, but Next 15 then sends an empty error shell as the server HTML (README, "Known limitation"); prefer the middleware.
12. **Don't touch the preview-build guard** (`SEO_INDEXABLE` in `next.config.ts`, `IS_INDEXABLE` in `lib/seo.ts`) unless asked. It keeps preview deployments out of Google.

## Project rules

- **No cookies, no third parties.** The privacy policy promises it.
  - Keep `localeCookie: false`, fonts through `next/font` (self-hosted), and no analytics, embeds or third-party scripts.
  - Adding one requires updating `/privacidad` first.
- **Facts only from `lib/site.ts`.** Never type the phone, hours or address in a component or a message.
  - The legal entity (`legal`) is pending confirmation by the owner (`TODO(cliente)`): keep it verbatim until they confirm.
- **Content comes from the restaurant.** Spanish copy is the restaurant's own text; English is a faithful translation.
  - Never invent facts: awards, prices, dates, dish descriptions beyond what a photo shows.
- **Readability:**
  - no text under 13px, body text 18px or more
  - every text colour at least 4.5:1 on its background (palette and measured contrasts in `lib/theme.ts`)
- **Motion:** CSS only, inside `@media (prefers-reduced-motion: no-preference)`, and content is never hidden while waiting for JavaScript or an animation.

## Conventions

- Project-specific data belongs in `lib/site.ts`, not inline in components.
- Comments explain *why* (a client request, an SEO reason, a platform limit), not what the code does.
- Keep `docs/` and `README.md` in sync when changing behaviour described there.

## Before finishing a task

- [ ] `npm run typecheck`, `npm run lint`, `npm run check:messages` and `npm run build` pass
- [ ] New or changed pages follow "A new page" in README.md (including `pathnames`)
- [ ] For SEO-relevant changes: `npm start` and `npm run seo:check -- http://localhost:3000` pass
