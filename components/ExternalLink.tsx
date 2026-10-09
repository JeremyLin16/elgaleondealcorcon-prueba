import { useTranslations } from "next-intl";

// Links to other sites (TheFork, the menu, Instagram, Google Maps): a new tab
// so the visitor keeps the restaurant's page, rel="noopener" so the other
// site cannot control this tab, and a hidden note for screen readers.
export default function ExternalLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const t = useTranslations("nav");
  return (
    <a href={href} target="_blank" rel="noopener" className={className}>
      {children}
      <span className="sr-only"> {t("newTab")}</span>
    </a>
  );
}
