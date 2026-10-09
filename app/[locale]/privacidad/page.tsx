import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { legal } from "@/lib/site";

// Privacy policy. Spanish text verbatim from the previous site. It states
// that the site collects no personal data and sets no cookies: keep that true
// (no analytics, no NEXT_LOCALE cookie, fonts served from this site). noindex
// and not in INDEXED_PATHS, like every legal page.
export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return pageMetadata({
    locale,
    path: "/privacidad",
    title: t("metaTitle"),
    description: t("metaDescription"),
    noindex: true,
  });
}

export default async function PrivacyPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("privacy");
  const company = { company: legal.company };

  return (
    <article className="wrap">
      <div className="longform">
        <p className="label">{t("label")}</p>
        <h1>{t("heading")}</h1>
        <span className="rule" aria-hidden="true" />
        <p>{t("intro", company)}</p>
        <h2>{t("purposeTitle")}</h2>
        <p>{t("purposeBody", company)}</p>
        <h2>{t("linksTitle")}</h2>
        <p>{t("linksBody", company)}</p>
        <h2>{t("cookiesTitle")}</h2>
        <p>{t("cookiesBody")}</p>
        <h2>{t("changesTitle")}</h2>
        <p>{t("changesBody", company)}</p>
      </div>
    </article>
  );
}
