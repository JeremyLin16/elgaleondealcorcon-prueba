"use client";

import { useLocale, useTranslations } from "next-intl";
import { getPathname, usePathname } from "@/i18n/navigation";
import { routing, type AppPathname } from "@/i18n/routing";

// Real <a href> links (not buttons with onClick): crawlers follow them to the
// other language version, and they work without JavaScript. usePathname
// returns the internal path, so each link is that page's URL in the other
// language (/aviso-legal <-> /en/legal-notice).
//
// A plain <a> with getPathname() instead of <Link locale>: next-intl's Link
// always adds the locale prefix when switching ("/es/aviso-legal") so that a
// locale cookie can be updated. This site has no locale cookie, so that URL
// would only redirect to "/aviso-legal": a wasted hop for visitors and
// crawlers. Switching language reloads the page anyway (each language is its
// own root layout).
//
// `compact` (the header bar below 1024px, where space is short): only the
// other language is shown ("EN" on a Spanish page). `variant="words"` (the
// mobile menu panel): full language names.
export default function LocaleSwitcher({
  className,
  compact = false,
  variant = "codes",
}: {
  className?: string;
  compact?: boolean;
  variant?: "codes" | "words";
}) {
  const t = useTranslations("localeSwitcher");
  const pathname = usePathname();
  const activeLocale = useLocale();
  // On the 404 page (unknown URL) offer each language's home page.
  const href: AppPathname = pathname in routing.pathnames ? pathname : "/";
  const words = variant === "words";

  return (
    <ul
      aria-label={t("label")}
      className={`flex items-center font-label font-medium ${
        words ? "text-[15px] tracking-[0.06em]" : "text-[13px] tracking-[0.18em]"
      } ${className ?? ""}`}
    >
      {routing.locales.map((locale, i) => {
        const active = locale === activeLocale;
        // In the compact bar the current language is not repeated.
        const hiddenInCompact = compact && active ? "max-lg:hidden" : "";
        return (
          <li key={locale} className={`flex items-center ${hiddenInCompact}`}>
            {i > 0 && (
              <span aria-hidden="true" className={`px-1 text-gold ${compact ? "max-lg:hidden" : ""}`}>
                ·
              </span>
            )}
            <a
              href={getPathname({ locale, href })}
              hrefLang={locale}
              lang={locale}
              title={words ? undefined : t(locale)}
              aria-current={active ? "true" : undefined}
              className={`inline-flex min-h-11 items-center justify-center no-underline ${words ? "px-2 first:pl-0" : "min-w-11"} ${
                active ? "text-gold" : "text-ivory-2 hover:text-gold"
              }`}
            >
              {words ? t(locale) : locale.toUpperCase()}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
