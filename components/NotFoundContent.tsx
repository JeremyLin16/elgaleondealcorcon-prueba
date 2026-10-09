import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LINKS } from "@/lib/site";
import ExternalLink from "./ExternalLink";

// Body of the localized 404 page (app/[locale]/not-found-page and
// app/[locale]/not-found.tsx): the home page's mission layout (gold thread,
// label, large serif title), so a wrong link still lands in the same house.
// It fills <main> (a flex column, app/[locale]/layout.tsx) and centres its
// content there, so the footer stays at the bottom of the window.
export default function NotFoundContent() {
  const t = useTranslations("notFound");
  const nav = useTranslations("nav");

  return (
    <div className="wrap flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-[40rem] flex-1 flex-col items-center justify-center pb-28 pt-10 text-center lg:pb-36">
        <span className="thread" aria-hidden="true" />
        <p className="label">{t("label")}</p>
        <h1 className="mb-6 mt-5 font-display text-[clamp(40px,10.5vw,46px)] font-medium leading-[1.06] text-ivory [text-wrap:balance] lg:text-[60px]">
          {t("heading")}
        </h1>
        <p className="max-w-[26em]">{t("body")}</p>
        <div className="mt-10 flex flex-col items-stretch gap-3 max-sm:w-full sm:flex-row sm:justify-center sm:gap-4">
          <Link href="/" className="btn btn-gold">
            {t("backHome")}
          </Link>
          <ExternalLink href={LINKS.reservations} className="btn btn-line">
            {nav("reserveTable")}
          </ExternalLink>
        </div>
      </div>
    </div>
  );
}
