import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/locale-switcher";

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
        <Link href="/" className="site-brand">
          {tc("appName")}
        </Link>

        <nav className="site-nav-product" aria-label="Product">
          <Link href="/courses" className="site-nav-link">
            {t("browse")}
          </Link>
        </nav>

        <div className="site-header-actions">
          <LocaleSwitcher />
          <Link href={cta.href} className="site-btn site-btn-primary">
            {cta.label}
          </Link>
        </div>
      </div>
    </header>
  );
}
