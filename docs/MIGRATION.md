# Replacing an Existing Site Without Losing Rankings

Rankings belong to URLs. A migration keeps them when every URL Google knows either still works or redirects permanently to its new equivalent. They are lost through 404s, downtime, a changed domain, and redirects that all point to the home page.

## This site: www.elgaleondealcorcon.com

The new site replaces the previous Next.js site on the same domain. URL map (old → new):

| Old URL | New site | How |
|---|---|---|
| `/` | `/` | same URL |
| `/home` (duplicate of the home page) | `/` | 308 permanent redirect (`next.config.ts`) |
| `/aviso-legal` | `/aviso-legal` | same URL (still `noindex`) |
| `/privacidad` | `/privacidad` | same URL (still `noindex`) |
| — | `/en`, `/en/legal-notice`, `/en/privacy` | new English pages |

- Canonical host: `www.elgaleondealcorcon.com` (`SITE_URL` in `lib/site.ts`). Before the switch, confirm with a `site:elgaleondealcorcon.com` search that Google indexes the `www` host. If it indexes the apex instead, change `SITE_URL` before launch, not after.
- Old photo URLs (`/photos/*.jpg`) are not kept. They only ranked in image search, if at all; check Search Console → Performance → Search type: Image before the switch. If any of them gets clicks, add a redirect to the matching `/images/*.webp`.
- After the switch, check the redirect and the kept URLs:
  ```bash
  for u in / /home /aviso-legal /privacidad; do curl -sI "https://www.elgaleondealcorcon.com$u" | grep -iE '^(HTTP|location)'; done
  ```

## 1. Inventory the old site (before writing code)

- [ ] **Indexed URLs.** Collect them from:
  - the Search Console **Pages** report (export it)
  - the old `sitemap.xml`
  - a `site:elgaleondealcorcon.com` search on Google
- [ ] **Most valuable URLs.** Search Console → **Performance** → Pages, sorted by clicks.
- [ ] **Canonical host Google uses:** www or not, http or https. Look at the URLs in the search results.
- [ ] **Current search appearance.** Screenshot the results for the brand name: title, sitelinks, knowledge panel.
- [ ] **What the old site does badly** (missing titles, wrong `lang`, broken sitemap). Fix it in the new site, don't copy it.
- [ ] **DNS records.** Export them all, especially MX and TXT (`google-site-verification`).
- [ ] **Search Console access.** Find out which Google account owns the property. If nobody knows, verify again with a company account; adding a new owner is harmless.

## 2. Plan the URLs

- [ ] **Keep the same domain and canonical host.** Don't switch www ↔ non-www during a migration.
- [ ] **Keep existing URLs where possible.** `localePrefix: "as-needed"` exists for exactly this: the old unprefixed URLs (`/`, `/faq`) stay the same in the default language.
- [ ] **Build a redirect map:** one row per old URL → its closest new equivalent.
  - Don't send everything to `/`; Google treats that as a 404.
  - Content that's truly gone with no equivalent can return 404/410.
  - Include files (`/menu.pdf`, images that ranked in Image search).
- [ ] **Add the map** to `next.config.ts` → `redirects()` with `permanent: true`.
- [ ] **Old pages you no longer want in results** (e.g. a contact page that ranked as a sitelink): redirect them to the best equivalent. Then, optionally, use Search Console → **Removals** to hide the old URL while Google recrawls.

## 3. Switch

- [ ] Check the new site on its Worker URL with `npm run seo:check` **before** touching DNS.
- [ ] Move DNS to Cloudflare while still pointing at the old host, so there is zero downtime ([DEPLOY-CLOUDFLARE.md §2](DEPLOY-CLOUDFLARE.md#2-dns-move-the-domain-to-cloudflare)).
- [ ] Switch to the Worker at a low-traffic time ([DEPLOY-CLOUDFLARE.md §3](DEPLOY-CLOUDFLARE.md#3-point-the-domain-at-the-worker)).
- [ ] Immediately afterwards:
  - [ ] `npm run seo:check -- https://<canonical-domain>`
  - [ ] Fetch every old URL from the redirect map and confirm one 301/308 hop to the right page:
    ```bash
    curl -sI https://www.elgaleondealcorcon.com/old-url | grep -iE '^(HTTP|location)'
    ```

## 4. Tell Google

- [ ] Search Console: submit the new sitemap; remove the old one if it's listed.
- [ ] URL Inspection → **Request indexing** for the home page and the key pages.
- [ ] **Do not** use the "Change of address" tool. It's only for moving to a different domain.
- [ ] Google Business Profile: point each location's website link at its new page, and update names if the brand changed.
  - The profile drives the knowledge panel and a large share of brand searches.
- [ ] Update links you control: social bios, delivery and booking platforms, directories.

## 5. Monitor

- [ ] First month: Search Console → **Pages** weekly. Check new 404s, "Redirect error", "Page with redirect" counts.
- [ ] Brand search results: sitelinks and titles usually update within 2–6 weeks.
- [ ] A dip of 1–2 weeks is normal. A drop that lasts usually means missing redirects; recheck the Pages report.
- [ ] Keep the redirects for **at least a year**, and keep the old hosting for 1–2 weeks as a rollback path.
