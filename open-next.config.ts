import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Without an incremental cache OpenNext falls back to a "dummy" cache and
// re-renders every page on every request, even pages Next prerendered at build
// time (measured: no x-opennext-cache header, full render each hit). The
// static-assets cache ships the prerendered HTML inside the Worker's assets
// (read-only), so prerendered pages are served from it (x-opennext-cache: HIT).
// enableCacheInterception answers those requests before the Next server
// starts, which saves CPU time per request.
//
// Read-only means no ISR: if a page ever needs `revalidate`, switch to the R2
// incremental cache (see docs/DEPLOY-CLOUDFLARE.md).
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
