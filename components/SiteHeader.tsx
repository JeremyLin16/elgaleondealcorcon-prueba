import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LINKS, restaurant } from "@/lib/site";
import ExternalLink from "./ExternalLink";
import LocaleSwitcher from "./LocaleSwitcher";
import MobileMenu from "./MobileMenu";

// Main navigation: plain links, server-rendered, so crawlers see every page
// and section. Section links point at the home page with a localized anchor
// ("/#cocina", "/en#kitchen") so they also work from the legal pages.
// The header has no background of its own: the page's green glow (body
// background, globals.css) runs behind it. Between 1024 and 1279px the logo
// and gaps are smaller so the full navigation still fits on one line.
export default function SiteHeader() {
  const t = useTranslations("nav");
  const anchor = useTranslations("anchors");

  const sections = [
    { hash: anchor("about"), label: t("about") },
    { hash: anchor("kitchen"), label: t("kitchen") },
    { hash: anchor("visit"), label: t("visit") },
  ];

  return (
    <header className="relative z-20">
      <div className="wrap flex h-[76px] items-center gap-2 min-[360px]:gap-4 lg:h-[104px] lg:gap-6 xl:gap-10">
        <Link href="/" className="flex min-h-11 shrink-0 items-center">
          <Image
            src="/logo.png"
            width={442}
            height={126}
            alt={t("logoAlt")}
            loading="eager"
            className="h-auto w-[124px] min-[360px]:w-[140px] min-[420px]:w-[150px] lg:w-[164px] xl:w-[190px]"
          />
        </Link>

        <nav aria-label={t("label")} className="ml-auto hidden lg:block">
          <ul className="flex gap-5 xl:gap-9">
            {sections.map((section) => (
              <li key={section.hash}>
                <Link href={{ pathname: "/", hash: section.hash }} className="nav-link whitespace-nowrap">
                  {section.label}
                </Link>
              </li>
            ))}
            <li>
              <ExternalLink href={LINKS.menu} className="nav-link whitespace-nowrap">
                {t("menu")}
              </ExternalLink>
            </li>
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 min-[360px]:gap-4 lg:ml-0 lg:gap-5 xl:gap-8">
          <ExternalLink href={LINKS.reservations} className="btn btn-line btn-sm hidden lg:inline-flex">
            {t("reserve")}
          </ExternalLink>

          <LocaleSwitcher compact className="lg:-mr-2.5" />

          <MobileMenu
            className="mobile-menu lg:hidden"
            summary={
              <summary>
                {/* Icon only on the narrowest phones, so the header fits in 320 px. */}
                <span className="sr-only min-[360px]:not-sr-only">
                  <span className="when-closed">{t("openMenu")}</span>
                  <span className="when-open">{t("closeMenu")}</span>
                </span>
                <i aria-hidden="true" />
              </summary>
            }
          >
            <nav aria-label={t("mobileLabel")} className="mobile-menu-panel">
              <ul className="mobile-menu-links">
                {sections.map((section) => (
                  <li key={section.hash}>
                    <Link href={{ pathname: "/", hash: section.hash }}>{section.label}</Link>
                  </li>
                ))}
                <li>
                  <ExternalLink href={LINKS.menu}>{t("menu")}</ExternalLink>
                </li>
              </ul>
              <ExternalLink href={LINKS.reservations} className="btn btn-gold mt-9">
                {t("reserveTable")}
              </ExternalLink>
              <div className="mobile-menu-meta">
                <p>
                  {restaurant.address.streetAddress} · {restaurant.address.postalCode} {restaurant.address.addressLocality}
                  <br />
                  <a href={`tel:${restaurant.telephone.e164}`}>{restaurant.telephone.display}</a>
                </p>
                <LocaleSwitcher variant="words" className="mt-4" />
              </div>
            </nav>
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}
