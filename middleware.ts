import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { NOT_FOUND_PATH, routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

// Internal paths of every page. Anything else is a 404.
const KNOWN_PATHS = new Set<string>(Object.keys(routing.pathnames));

/**
 * next-intl routing (locale prefix, localized pathnames), then the 404 rule:
 * an unknown URL is rewritten to app/[locale]/not-found-page with status 404.
 *
 * Why not notFound() in a catch-all page: in Next.js 15 that returns a 404
 * whose HTML is an empty error shell (<html id="__next_error__">, rendered in
 * the browser, home page title). A rewrite with a status serves the real,
 * prerendered 404 page in the right language, with its own title, on
 * `next start` and on Cloudflare Workers (checked: status 404,
 * x-opennext-cache HIT).
 */
export default function middleware(request: NextRequest) {
  const response = handleI18nRouting(request);
  // Redirects (/es/... -> /..., /en/aviso-legal -> /en/legal-notice).
  if (response.headers.has("location")) return response;

  // next-intl either rewrites ("/aviso-legal" -> "/es/aviso-legal",
  // "/en/legal-notice" -> "/en/aviso-legal") or lets the URL through as is
  // ("/en", "/en/xyz"): either way the result is "/<locale>/<internal path>".
  const internal = new URL(response.headers.get("x-middleware-rewrite") ?? request.url);
  const [, locale, ...rest] = internal.pathname.split("/");
  if (KNOWN_PATHS.has(`/${rest.join("/")}`)) return response;

  return NextResponse.rewrite(new URL(`/${locale}${NOT_FOUND_PATH}`, request.url), { status: 404 });
}

export const config = {
  // Everything except API routes, Next internals and files with an extension
  // (robots.txt, sitemap.xml, images...). Unknown files get Next's 404
  // (app/not-found.tsx).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
