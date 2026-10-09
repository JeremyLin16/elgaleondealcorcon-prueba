import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LINKS } from "@/lib/site";
import ExternalLink from "./ExternalLink";

// No year in the copyright line: a year computed at build time freezes on the
// last deploy, and a hard-coded one goes stale every January.
export default function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-gold/20 pb-12 pt-14">
      <div className="wrap flex flex-col gap-8 md:flex-row md:flex-wrap md:items-center md:justify-between">
        <Link href="/" className="flex min-h-11 shrink-0 items-center self-start md:self-auto">
          <Image src="/logo.png" width={442} height={126} alt={t("logoAlt")} className="h-auto w-[150px]" />
        </Link>
        <nav aria-label={t("label")}>
          <ul className="flex flex-wrap gap-x-6 gap-y-1 sm:gap-x-8">
            <li>
              <Link href="/aviso-legal" className="footer-link inline-flex min-h-11 items-center">
                {t("legalNotice")}
              </Link>
            </li>
            <li>
              <Link href="/privacidad" className="footer-link inline-flex min-h-11 items-center">
                {t("privacy")}
              </Link>
            </li>
            <li>
              <ExternalLink href={LINKS.instagram} className="footer-link inline-flex min-h-11 items-center">
                {t("instagram")}
              </ExternalLink>
            </li>
          </ul>
        </nav>
        <p className="font-label text-[14px] font-medium tracking-[0.06em] text-mute">{t("copyright")}</p>
      </div>
    </footer>
  );
}
