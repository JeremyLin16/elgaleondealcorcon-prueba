import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { legal } from "@/lib/site";

// Legal notice (LSSI art. 10). Spanish text verbatim from the previous site;
// the company data comes from `legal` in lib/site.ts (pending confirmation by
// the owner). noindex, like every legal page: reachable from the footer but
// kept out of search results (it could otherwise take a sitelink slot), and
// not in INDEXED_PATHS.
export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "legalNotice" });
  return pageMetadata({
    locale,
    path: "/aviso-legal",
    title: t("metaTitle"),
    description: t("metaDescription"),
    noindex: true,
  });
}

export default async function LegalNoticePage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("legalNotice");
  const company = { company: legal.company };

  return (
    <article className="wrap">
      <div className="longform">
        <p className="label">{t("label")}</p>
        <h1>{t("heading")}</h1>
        <span className="rule" aria-hidden="true" />
        <p>{t("intro")}</p>
        <dl>
          <dt>{t("owner")}</dt>
          <dd>{legal.company}</dd>
          <dt>{t("taxId")}</dt>
          <dd>{legal.taxId}</dd>
          <dt>{t("address")}</dt>
          <dd>{legal.registeredAddress}</dd>
          <dt>{t("phone")}</dt>
          <dd className="figures">{legal.phone}</dd>
          <dt>{t("email")}</dt>
          <dd>{legal.email}</dd>
        </dl>
        <h2>{t("termsTitle")}</h2>
        <p>{t("termsBody")}</p>
        <h2>{t("propertyTitle")}</h2>
        <p>{t("propertyBody", company)}</p>
        <h2>{t("liabilityTitle")}</h2>
        <p>{t("liabilityBody", company)}</p>
        <h2>{t("changesTitle")}</h2>
        <p>{t("changesBody", company)}</p>
      </div>
    </article>
  );
}
