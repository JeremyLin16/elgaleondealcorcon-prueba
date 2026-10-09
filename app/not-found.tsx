import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";
import messages from "@/messages/es.json";
import { fontVariables } from "./fonts";
import "./globals.css";

// 404 for requests outside the [locale] segment: paths with a file extension
// (/foto.jpg, /menu.pdf) skip the middleware, so no locale is known. Spanish,
// the site's default language. Localized 404: app/[locale]/not-found.tsx.
// Same look as components/NotFoundContent.tsx, with the logo in place of the
// header (no next-intl context here for the header's links).
const t = messages.notFound;

// Next adds <meta name="robots" content="noindex"> to this page itself.
export const metadata: Metadata = {
  title: `${t.metaTitle} | ${SITE_NAME}`,
  description: t.body,
};

export default function NotFound() {
  return (
    <html lang="es" className={fontVariables}>
      <body>
        {/* Plain <a>: outside [locale] there is no next-intl context for the
            i18n Link, and a full page load is right after a 404. */}
        <header className="wrap flex h-[76px] items-center lg:h-[104px]">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/">
            {/* eslint-disable-next-line @next/next/no-img-element -- static logo, no next/image context needed */}
            <img src="/logo.png" width={442} height={126} alt={messages.nav.logoAlt} className="h-auto w-[150px] lg:w-[190px]" />
          </a>
        </header>
        <main className="wrap">
          <div className="mx-auto flex min-h-[calc(100svh-180px)] max-w-[40rem] flex-col items-center justify-center pb-28 pt-10 text-center">
            <span className="thread" aria-hidden="true" />
            <p className="label">{t.label}</p>
            <h1 className="mb-6 mt-5 font-display text-[clamp(40px,10.5vw,46px)] font-medium leading-[1.06] text-ivory lg:text-[60px]">
              {t.heading}
            </h1>
            <p>{t.body}</p>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" className="btn btn-gold mt-10">
              {t.backHome}
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
