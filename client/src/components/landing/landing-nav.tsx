"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { BrandMark } from "@/components/brand/brand-mark";
import { navCtaHref } from "@/lib/auth/nav-cta";

interface LandingNavProps {
  signedIn: boolean;
  dashboardHref?: string | null;
}

const SECTIONS = [
  { href: "#journey", key: "navStory" as const, id: "journey" },
  { href: "#trust", key: "navTrust" as const, id: "trust" },
  { href: "#faq", key: "navFaq" as const, id: "faq" },
  { href: "#waitlist", key: "navWaitlist" as const, id: "waitlist" },
];

export function LandingNav({ signedIn, dashboardHref }: LandingNavProps) {
  const t = useTranslations("Landing");
  const tc = useTranslations("Common");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const ctaHref = navCtaHref(signedIn, dashboardHref ?? null);
  const ctaLabel =
    signedIn && dashboardHref ? t("goToApp") : t("navGetStarted");

  useEffect(() => {
    const sections = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      Boolean,
    ) as HTMLElement[];
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5] },
    );

    for (const el of sections) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeMobile();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeMobile]);

  return (
    <header className="site-header landing-nav">
      <div className="site-header-inner">
        <Link
          href="/"
          prefetch={false}
          className="site-brand brand-lockup"
          aria-label={tc("brandHome")}
          onClick={closeMobile}
        >
          <BrandMark className="brand-lockup-mark" aria-hidden="true" />
          <span>{tc("appName")}</span>
        </Link>

        <nav className="site-nav-desktop" aria-label={tc("landingSections")}>
          {SECTIONS.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className={`site-nav-link ${activeId === s.id ? "is-active" : ""}`}
            >
              {t(s.key)}
            </a>
          ))}
        </nav>

        <div className="site-header-actions">
          <LocaleSwitcher />
          <Link href={ctaHref} prefetch={false} className="btn btn-primary btn-sm">
            {ctaLabel}
          </Link>

          <button
            type="button"
            className="site-nav-toggle"
            aria-expanded={mobileOpen}
            aria-controls="landing-mobile-nav"
            onClick={() => setMobileOpen((o) => !o)}
          >
            <span className="sr-only">
              {mobileOpen ? t("navMenuClose") : t("navMenuOpen")}
            </span>
            <span
              className={`site-nav-toggle-icon ${mobileOpen ? "is-open" : ""}`}
              aria-hidden
            />
          </button>
        </div>
      </div>

      <div
        id="landing-mobile-nav"
        className={`site-nav-mobile ${mobileOpen ? "is-open" : ""}`}
        hidden={!mobileOpen}
      >
        <nav aria-label={tc("landingSections")}>
          <ul className="site-nav-mobile-list">
            {SECTIONS.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  className={`site-nav-mobile-link ${activeId === s.id ? "is-active" : ""}`}
                  onClick={closeMobile}
                >
                  {t(s.key)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="site-nav-mobile-actions">
          <Link
            href={ctaHref}
            prefetch={false}
            className="btn btn-primary btn-block"
            onClick={closeMobile}
          >
            {ctaLabel}
          </Link>
        </div>
      </div>

      {mobileOpen ? (
        <button
          type="button"
          className="site-nav-backdrop"
          aria-label={t("navMenuClose")}
          onClick={closeMobile}
        />
      ) : null}
    </header>
  );
}
