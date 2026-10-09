import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import NotFoundContent from "@/components/NotFoundContent";
import { notFoundMetadata } from "@/lib/seo";

// The localized 404 page. middleware.ts rewrites every unknown URL here with
// status 404, so the visitor (and Google) gets a server-rendered page with its
// own title and a real 404 status, served from the page cache. Its own URL
// (/not-found-page) is not in routing.pathnames, so it is a 404 as well.
export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "notFound" });
  return notFoundMetadata({ title: t("metaTitle"), description: t("body") });
}

export default async function NotFoundPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  return <NotFoundContent />;
}
