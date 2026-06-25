import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { BrandMark } from "@/components/brand/brand-mark";

interface ProductHeaderProps {
  /** Smart nav CTA — Get started or Go to dashboard. */
  cta: { href: string; label: string };
}

/** Sticky Product Mode nav — shared across catalog and public course viewer. */
export async function ProductHeader({ cta }: ProductHeaderProps) {
  const tc = await getTranslations("Common");
  const t = await getTranslations("Catalog");

  return (
    <header className="site-header product-nav">
      <div className="site-header-inner site-header-inner--product">
        <Link
          href="/"
          className="site-brand brand-lockup"
          aria-label={tc("brandHome")}
        >
          <BrandMark className="brand-lockup-mark" aria-hidden="true" />
          <span>{tc("appName")}</span>
        </Link>

        <nav className="site-nav-product" aria-label={tc("productNavigation")}>
          <Link href="/courses" className="site-nav-link">
            {t("browse")}
          </Link>
        </nav>

        <div className="site-header-actions">
          <LocaleSwitcher />
          <Link href={cta.href} prefetch={false} className="site-btn site-btn-primary">
            {cta.label}
          </Link>
        </div>
      </div>
    </header>
  );
}
