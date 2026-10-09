# Deploying to Cloudflare Workers

The site runs as a Cloudflare Worker built by [OpenNext](https://opennext.js.org/cloudflare). Config: `wrangler.jsonc` and `open-next.config.ts`.

## 1. Connect the repo (Workers Builds)

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Import a repository** → pick the GitHub repo.
2. Build settings:
   - **Build command:** `npx opennextjs-cloudflare build`
   - **Deploy command:** `npx opennextjs-cloudflare deploy`
   - **Production branch:** `main`
3. The Worker name must match `"name"` in `wrangler.jsonc` (and the `service` under `WORKER_SELF_REFERENCE`): **`elgaleondealcorcon`**.
4. **Settings → Build → Branch control:** uncheck **Builds for non-production branches** unless you want preview URLs.
   - Previews are safe for SEO either way: any branch other than `main` builds with `robots.txt: Disallow: /` and `noindex` (see `next.config.ts`).
   - But each push of any branch triggers a build, which can surprise people.

Check the result on `https://<worker-name>.<account>.workers.dev`:
```bash
npm run seo:check -- https://<worker-name>.<account>.workers.dev
```
On the workers.dev URL the canonical tags point to the real domain. That's expected, and the script handles it.

## 2. DNS: move the domain to Cloudflare

Recommended: keep the domain registered where it is (GoDaddy, etc.), but let Cloudflare manage the DNS.

1. Cloudflare → **Add a domain** → Free plan. Cloudflare scans the existing records.
2. **Compare them with the old DNS panel before going further.** Especially:
   - **MX** records, if the domain has email
   - **TXT** records: `google-site-verification=...`, SPF, DKIM, DMARC
   - Losing the Google TXT record means losing Search Console access.
3. If the old site is still live, leave its records pointing to the old host. That way the switch has no downtime.
4. If the registrar has DNSSEC enabled, turn it off before changing nameservers.
5. At the registrar, replace the nameservers with the two Cloudflare ones. Wait for the email saying the zone is **Active**: minutes to a few hours.

## 3. Point the domain at the Worker

Do this at a low-traffic time; it can mean a few minutes of downtime.

This site's canonical host is `www.elgaleondealcorcon.com` (`SITE_URL` in `lib/site.ts`):

1. **DNS:** delete the records that point to the old host for `www`. Keep the TXT and MX records.
2. **Worker → Settings → Domains & Routes → Add → Custom domain** → `www.elgaleondealcorcon.com`. Cloudflare creates the DNS record and the certificate (1–5 minutes).
3. **The non-canonical host (`elgaleondealcorcon.com`):**
   - Add a proxied placeholder record so traffic reaches Cloudflare: `A @ 192.0.2.1`, orange cloud. The address is never contacted; the redirect rule answers first.
   - **Rules → Redirect Rules → Templates → "Redirect from Root to WWW"** (or "WWW to Root" for the opposite choice), status **301**, preserve query string.
4. **SSL/TLS → Edge Certificates → Always Use HTTPS:** on.
5. **Worker → Settings → Domains & Routes:** disable the `workers.dev` route for production, so the site only exists at one address.
6. Verify:
   ```bash
   npm run seo:check -- https://www.elgaleondealcorcon.com
   ```
   This also checks that `http://elgaleondealcorcon.com`, `https://elgaleondealcorcon.com` and `http://www.elgaleondealcorcon.com` each reach the canonical origin in **one** 301/308 hop.

If the canonical host were the apex (`elgaleondealcorcon.com`), the roles would swap: the custom domain goes on the apex, and `www` gets the placeholder record plus the "WWW to Root" redirect.

## 4. After the switch

- Follow [SEO-CHECKLIST.md §4](SEO-CHECKLIST.md#4-after-launch): Search Console, sitemap, Bing, Google Business Profile.
- **Keep the old hosting project for 1–2 weeks** in case you need to roll back. Rollback = put the old DNS records back. Then remove the domain from the old host.

## Notes and limits

- **Security headers:** `next.config.ts` → `headers()` adds HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` and `Permissions-Policy` to the pages the Worker renders (pages, 404s, `robots.txt`, `sitemap.xml`; redirects go out without them, which is harmless); `public/_headers` repeats them (minus HSTS) for static files, which Cloudflare serves without running the Worker. Keep both lists in sync.
- **404s:** `middleware.ts` rewrites unknown URLs to the prerendered 404 page with status 404. On Workers the response is `404` with `x-opennext-cache: HIT`; `npm run seo:check` checks it on every deployment.
- **No image optimisation:** on-the-fly resizing exceeds the Workers CPU limit (error 1102), so `images.unoptimized` is `true`. Optimise images before committing them.
- **Page cache (`open-next.config.ts`):** without an incremental cache OpenNext uses a "dummy" cache and **re-renders every page on every request**, even pages that Next prerendered at build time. This project uses the **static-assets incremental cache** with cache interception: the prerendered HTML is uploaded with the Worker's static assets and served from there.
  - Check it on any deployment: `curl -sI https://<host>/ | grep -i x-opennext-cache` should print `HIT`.
  - `opennextjs-cloudflare deploy` (and `preview`) upload the cache automatically. For a manual `wrangler dev`, run `npx opennextjs-cloudflare populateCache local` first.
  - The cache is read-only: **no ISR**. If a page ever needs `revalidate`, switch to the R2 incremental cache (plus a queue) as described in the [OpenNext caching docs](https://opennext.js.org/cloudflare/caching).
- **Next.js version:** `@opennextjs/cloudflare` declares which Next versions it supports in its `peerDependencies`. Check them before upgrading Next:
  ```bash
  npm view @opennextjs/cloudflare peerDependencies
  ```
- **Local run on the Workers runtime:** `npm run preview`. Copy `.dev.vars.example` to `.dev.vars` first.
