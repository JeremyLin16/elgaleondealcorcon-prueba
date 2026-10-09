import NotFoundContent from "@/components/NotFoundContent";

// Boundary for notFound() called by a page under [locale] (no page does
// today). Unknown URLs do NOT come here: the middleware sends them to
// app/[locale]/not-found-page, see middleware.ts.
//
// Limitation (Next.js 15): when notFound() is thrown while rendering, the
// status is 404 but the server HTML is Next's empty error shell
// (<html id="__next_error__">) and this content is only rendered in the
// browser. React error boundaries do not run during server rendering. If a
// future page needs notFound() (e.g. an unknown slug), prefer checking the
// slug in the middleware the same way.
export default function NotFoundBoundary() {
  return <NotFoundContent />;
}
