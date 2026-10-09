import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ExternalLink from "@/components/ExternalLink";
import JsonLd from "@/components/JsonLd";
import Photo from "@/components/Photo";
import type { Locale } from "@/i18n/routing";
import { KITCHEN_PHOTOS } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";
import { INSTAGRAM_HANDLE, LINKS, restaurant } from "@/lib/site";
import { organizationSchema, restaurantSchema, websiteSchema } from "@/lib/structuredData";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "site" });
  // The street comes from lib/site.ts, so the search snippet follows an
  // address change like the page and the JSON-LD do.
  const description = t("description", { street: restaurant.address.streetAddress });
  // Absolute title: it already starts with the restaurant's name.
  return pageMetadata({ locale, path: "/", title: t("title"), description, absoluteTitle: true });
}

const number = (n: number) => String(n).padStart(2, "0");

// Home page: every photo hangs as a
// numbered painting in a gold hairline frame. Every fact (hours, address,
// phone, links) comes from lib/site.ts, the same source as the JSON-LD; every
// text from messages/*.json.
//
// Headings: one h1 (hero), one h2 per section, h3 inside "Horario y
// contacto". The small gold capitals above the titles are paragraphs, not
// headings, so the visual size follows the outline.
export default async function HomePage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = (await props.params) as { locale: Locale };
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const anchor = await getTranslations("anchors");
  const { address, telephone } = restaurant;
  const hours = restaurant.hours.map((slot) => ({
    label: t(`hours.${slot.id}`),
    value: `${slot.opens} – ${slot.closes}`,
  }));

  return (
    <>
      <JsonLd data={[organizationSchema(), websiteSchema(locale), restaurantSchema(restaurant, locale)]} />

      {/* Hero. The green glow behind it is the body background (globals.css).
          Phones: tighter gaps than on larger screens, so the pulpo starts in
          the first screen under the facts. Short laptop screens: see .hero in
          globals.css. */}
      <section aria-labelledby="hero-title" className="hero">
        <div className="hero-wrap wrap grid items-center gap-x-[clamp(48px,6vw,96px)] gap-y-8 pb-20 pt-5 sm:gap-y-14 lg:min-h-[calc(100svh-104px)] lg:grid-cols-[minmax(0,1fr)_auto] lg:pb-14 lg:pt-0">
          <div>
            <p className="label max-sm:tracking-[0.16em]">
              <span className="whitespace-nowrap">{t("hero.eyebrow")} ·</span>{" "}
              <span className="whitespace-nowrap">
                {address.addressLocality}, {address.addressRegion}
              </span>
            </p>
            {/* The only <h1> of the page. Desktop: a short first line, then
                the gold italic line on its own ("Cocina / tradicional
                española, / hecha como antes"). Phones: the italic runs on and
                the lines are balanced, so no word is left alone. */}
            <h1
              id="hero-title"
              className="hero-title mb-6 mt-5 font-display text-[clamp(36px,11vw,44px)] font-medium leading-[1.06] tracking-[-0.012em] text-ivory [text-wrap:balance] lg:mb-7 lg:mt-6 lg:text-[clamp(50px,4.4vw,64px)] lg:[text-wrap:wrap] [&_em]:text-gold lg:[&_em]:block"
            >
              {t.rich("hero.title", {
                br: () => <br className="hidden lg:inline" />,
                em: (chunks) => <em>{chunks}</em>,
              })}
            </h1>
            <p className="hero-intro mb-7 max-w-[30em] sm:mb-9 lg:mb-10">{t("hero.intro")}</p>
            <div className="btn-pair">
              <ExternalLink href={LINKS.reservations} className="btn btn-gold">
                {t("hero.reserve")}
              </ExternalLink>
              <ExternalLink href={LINKS.menu} className="btn btn-line">
                {t("hero.menu")}
              </ExternalLink>
            </div>
            {/* Contact early: hours, address and phone right under the
                buttons, before the photo, on every screen size. */}
            <dl className="facts mt-7 max-w-[34rem] sm:mt-12 lg:mt-14">
              {hours.map((slot) => (
                <div key={slot.label}>
                  <dt>{slot.label}</dt>
                  <dd>{slot.value}</dd>
                </div>
              ))}
              <div>
                <dt>{t("facts.address")}</dt>
                {/* Phones: the street only (the eyebrow above already says
                    "Alcorcón, Madrid"), so the facts take one line less. */}
                <dd>
                  {address.streetAddress}
                  <span className="max-sm:hidden"> · {address.addressLocality}</span>
                </dd>
              </div>
              <div>
                <dt>{t("facts.phone")}</dt>
                <dd>
                  <a
                    href={`tel:${telephone.e164}`}
                    className="tap whitespace-nowrap underline decoration-gold/50 decoration-1 underline-offset-[6px] hover:text-gold"
                  >
                    {telephone.display}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <figure className="painting hero-painting max-w-[560px]">
            <div className="frame">
              <div className="canvas">
                <Photo
                  name="pulpo"
                  alt={t("photos.pulpo.alt")}
                  sizes="(max-width: 639px) calc(100vw - 62px), (max-width: 1023px) 530px, 470px"
                  priority
                  className="aspect-[4/5] object-cover"
                />
              </div>
            </div>
            <figcaption className="caption">
              <span className="caption-n">{number(1)}</span>
              {t("photos.pulpo.caption")}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* About: one quiet moment for the restaurant's mission, then the house. */}
      <section id={anchor("about")} aria-labelledby="about-title" className="overflow-hidden pb-28 pt-6 lg:pb-48 lg:pt-10">
        <div className="wrap">
          <div className="glow-behind mx-auto max-w-[56rem] text-center">
            <span className="thread" aria-hidden="true" />
            <p className="label">{t("about.label")}</p>
            <p className="mx-auto mb-8 mt-6 max-w-[32em] text-mute">{t("about.lead")}</p>
            <blockquote className="mx-auto max-w-[17em] font-display text-[clamp(32px,8.8vw,36px)] font-medium italic leading-[1.16] tracking-[-0.005em] text-ivory [text-wrap:balance] lg:text-[clamp(44px,4.2vw,60px)]">
              {t("about.quote")}
            </blockquote>
            <span className="rule" aria-hidden="true" />
          </div>

          <div className="mt-24 grid items-center gap-x-[clamp(48px,7vw,112px)] gap-y-12 lg:mt-40 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <figure className="painting max-w-[600px]">
              <div className="frame">
                <div className="canvas">
                  <Photo
                    name="vino"
                    alt={t("photos.vino.alt")}
                    sizes="(max-width: 639px) calc(100vw - 62px), (max-width: 1023px) 570px, 560px"
                  />
                </div>
              </div>
            </figure>
            <div className="max-w-[34em]">
              <p className="label">{t("house.label")}</p>
              <h2 id="about-title" className="section-title mb-7 mt-5">
                {t("house.title")}
              </h2>
              <p className="mb-5">{t("house.p1")}</p>
              <p className="mb-5">{t("house.p2")}</p>
              <p>{t("house.p3")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Kitchen: a gallery wall of six dishes, numbered after the hero's 01. */}
      <section id={anchor("kitchen")} aria-labelledby="kitchen-title" className="overflow-hidden border-y border-gold/10 bg-wall py-24 lg:py-40">
        <div className="wrap">
          <div className="mb-14 grid gap-x-20 gap-y-6 lg:mb-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-end">
            <div>
              <p className="label">{t("kitchen.label")}</p>
              <h2 id="kitchen-title" className="section-title mt-5">
                {t("kitchen.title")}
              </h2>
            </div>
            <p className="max-w-[30em] lg:pb-1">{t("kitchen.text")}</p>
          </div>
          <ul className="gallery">
            {KITCHEN_PHOTOS.map((name, i) => (
              <li key={name}>
                <figure className="painting">
                  <div className="frame frame-sm">
                    <div className="canvas">
                      <Photo
                        name={name}
                        alt={t(`photos.${name}.alt`)}
                        sizes="(max-width: 519px) min(340px, calc(100vw - 62px)), (max-width: 1023px) min(340px, calc(50vw - 56px)), 340px"
                      />
                    </div>
                  </div>
                  <figcaption className="caption">
                    <span className="caption-n">{number(i + 2)}</span>
                    {t(`photos.${name}.caption`)}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
          <div className="mt-16 flex justify-center lg:mt-24">
            <ExternalLink href={LINKS.menu} className="btn btn-line">
              {t("kitchen.menu")}
            </ExternalLink>
          </div>
        </div>
      </section>

      {/* Invitation band in the brand green. Its h2 stays a step under the
          hero's h1 at every width, so visual size follows the outline. */}
      <section aria-labelledby="invite-title" className="bg-green py-28 text-center lg:py-48">
        <div className="wrap">
          <p className="mx-auto mb-8 max-w-[28em] text-[20px] text-on-green [text-wrap:balance]">{t("invite.text")}</p>
          <h2
            id="invite-title"
            className="mx-auto mb-12 max-w-[14em] font-display text-[clamp(34px,10.4vw,40px)] font-medium italic leading-[1.1] text-ivory [text-wrap:balance] lg:mb-14 lg:text-[clamp(48px,4.2vw,60px)]"
          >
            {t.rich("invite.title", {
              nw: (chunks) => <span className="sm:whitespace-nowrap">{chunks}</span>,
              gold: (chunks) => <span className="mt-1 block text-gold">{chunks}</span>,
            })}
          </h2>
          <div className="btn-pair justify-center">
            <ExternalLink href={LINKS.reservations} className="btn btn-gold">
              {t("invite.reserve")}
            </ExternalLink>
            <ExternalLink href={LINKS.menu} className="btn btn-line">
              {t("invite.menu")}
            </ExternalLink>
          </div>
        </div>
      </section>

      {/* Visit: address, hours and contact in a ruled three-column grid. */}
      <section
        id={anchor("visit")}
        aria-labelledby="visit-title"
        className="bg-[radial-gradient(50%_60%_at_88%_30%,theme(colors.glow/70%),transparent_70%)] py-24 lg:py-36"
      >
        <div className="wrap">
          <p className="label">{t("visit.label")}</p>
          <h2 id="visit-title" className="section-title mb-12 mt-5 lg:mb-16">
            {t("visit.title")}
          </h2>
          <div className="figures grid border-t border-gold/60 lg:grid-cols-3">
            <div className="py-9 lg:pb-2 lg:pr-10 lg:pt-11">
              <h3 className="label mb-5">{t("visit.address")}</h3>
              <address className="mb-7 font-display text-[26px] font-medium not-italic leading-snug text-ivory">
                {address.streetAddress}
                <br />
                {address.postalCode} {address.addressLocality}, {address.addressRegion}
              </address>
              <ExternalLink href={LINKS.maps} className="text-link">
                {t("visit.directions")}
              </ExternalLink>
            </div>
            <div className="border-t border-gold/20 py-9 lg:border-l lg:border-t-0 lg:px-10 lg:pb-2 lg:pt-11">
              <h3 className="label mb-5">{t("visit.hours")}</h3>
              <dl className="grid gap-y-4">
                {hours.map((slot) => (
                  <div key={slot.label}>
                    <dt>{slot.label}</dt>
                    <dd className="font-display text-[24px] font-medium leading-tight text-ivory">{slot.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="border-t border-gold/20 py-9 lg:border-l lg:border-t-0 lg:pb-2 lg:pl-10 lg:pt-11">
              <h3 className="label mb-5">{t("visit.contact")}</h3>
              <ul className="space-y-3 font-display text-[24px] font-medium leading-snug text-ivory [overflow-wrap:anywhere]">
                <li>
                  <a href={`tel:${telephone.e164}`} className="tap no-underline hover:text-gold">
                    {telephone.display}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${restaurant.email}`} className="tap no-underline hover:text-gold">
                    {restaurant.email}
                  </a>
                </li>
                <li>
                  <ExternalLink href={LINKS.instagram} className="tap no-underline hover:text-gold">
                    {INSTAGRAM_HANDLE}
                  </ExternalLink>
                </li>
              </ul>
              <p className="mt-8">
                <ExternalLink href={LINKS.reservations} className="text-link">
                  {t("visit.reserve")}
                </ExternalLink>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
