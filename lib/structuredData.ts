// schema.org JSON-LD builders. Render them with <JsonLd data={...} />.
// Rule: JSON-LD must describe what is visible on the page, never more (no
// price range, ratings, awards or dates the page does not show).
// Validate with https://search.google.com/test/rich-results and
// https://validator.schema.org after every change.
import type { Locale } from "@/i18n/routing";
import { localizedUrl } from "./seo";
import { LINKS, organization, SITE_NAME, SITE_URL, type DayKey, type OpeningHours, type Restaurant } from "./site";

const abs = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path}`);

/** Home page. Who is behind the site + official profiles. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: organization.name,
    url: SITE_URL,
    logo: abs(organization.logo),
    ...(organization.sameAs.length > 0 && { sameAs: organization.sameAs }),
  };
}

/** Home page. Google uses it to pick the site name shown above the result. */
export function websiteSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    inLanguage: locale,
  };
}

const SCHEMA_DAY: Record<DayKey, string> = {
  monday: "https://schema.org/Monday",
  tuesday: "https://schema.org/Tuesday",
  wednesday: "https://schema.org/Wednesday",
  thursday: "https://schema.org/Thursday",
  friday: "https://schema.org/Friday",
  saturday: "https://schema.org/Saturday",
  sunday: "https://schema.org/Sunday",
};

// Closing at midnight is written "23:59": "00:00" as a closing time reads as
// the start of the same day (opens 08:00, closes 00:00 = before it opens).
// 23:59 is what Google's documentation uses for "until the end of the day".
// The page still shows 00:00.
const schemaCloses = (closes: string) => (closes === "00:00" ? "23:59" : closes);

// One OpeningHoursSpecification per group of days; days not listed are closed
// (absence means closed in schema.org).
function openingHours(hours: readonly OpeningHours[]) {
  return hours.map((slot) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: slot.days.map((day) => SCHEMA_DAY[day]),
    opens: slot.opens,
    closes: schemaCloses(slot.closes),
  }));
}

/** The restaurant, on its page (the home page). */
export function restaurantSchema(restaurant: Restaurant, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": restaurant.type,
    name: restaurant.name,
    url: localizedUrl(locale, restaurant.path),
    image: abs(restaurant.image),
    logo: abs(organization.logo),
    telephone: restaurant.telephone.e164,
    email: restaurant.email,
    address: { "@type": "PostalAddress", ...restaurant.address },
    geo: { "@type": "GeoCoordinates", ...restaurant.geo },
    hasMap: LINKS.maps,
    openingHoursSpecification: openingHours(restaurant.hours),
    servesCuisine: restaurant.servesCuisine[locale],
    acceptsReservations: LINKS.reservations,
    menu: LINKS.menu,
    sameAs: organization.sameAs,
  };
}
