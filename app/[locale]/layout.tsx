import type { Metadata, Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { routing } from "@/i18n/routing";
import { IS_INDEXABLE } from "@/lib/seo";
import { restaurant, SITE_NAME, SITE_URL } from "@/lib/site";
import { THEME } from "@/lib/theme";
import { fontVariables } from "../fonts";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Only "es" and "en" are valid first segments. Paths with a dot skip the
// middleware (/foto.jpg), so without this /foto.jpg would reach this layout as
// locale "foto.jpg" and its notFound() would produce an empty error page.
export const dynamicParams = false;

// Site-wide defaults only. Canonical, hreflang and Open Graph depend on the
// page, so each page sets them through pageMetadata() (lib/seo.ts).
export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "site" });
  return {
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
    title: { default: t("title"), template: `%s | ${SITE_NAME}` },
    description: t("description", { street: restaurant.address.streetAddress }),
    ...(!IS_INDEXABLE && { robots: { index: false, follow: false } }),
  };
}

export const viewport: Viewport = {
  // Browser UI (Android address bar) in the page's night green.
  themeColor: THEME.night,
  colorScheme: "dark",
};

export default async function LocaleLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const t = await getTranslations("nav");
  // Only the texts client components need reach the browser (today just the
  // language switcher). Without this every page would carry the whole
  // messages file, legal texts included, in its HTML. A new client component
  // that calls useTranslations needs its namespace added here.
  const messages = await getMessages();
  const clientMessages = { localeSwitcher: messages.localeSwitcher };

  return (
    // lang per locale: tells Google (and screen readers) the page language.
    // data-scroll-behavior: globals.css scrolls anchors smoothly; this tells
    // Next.js to switch it off during page navigations (otherwise a new page
    // would visibly scroll to its top).
    <html lang={locale} className={fontVariables} data-scroll-behavior="smooth">
      {/* Flex column: the footer sits at the bottom of the window even when a
          page is shorter than the window (the 404 page). */}
      <body className="flex min-h-svh flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-gold focus:px-4 focus:py-3 focus:text-night">
          {t("skipToContent")}
        </a>
        <NextIntlClientProvider messages={clientMessages}>
          <SiteHeader />
          <main id="main" tabIndex={-1} className="flex shrink-0 grow flex-col outline-none">
            {props.children}
          </main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
