"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/locale-switcher";

interface LandingNavProps {
  signedIn: boolean;
  dashboardHref?: string | null;
}

const ANCHORS = [
  { href: "#features", key: "navFeatures" as const },
  { href: "#demo", key: "navDemo" as const },
  { href: "#how-it-works", key: "navHow" as const },
  { href: "#waitlist", key: "navWaitlist" as const },
];

export function LandingNav({ signedIn, dashboardHref }: LandingNavProps) {
  const t = useTranslations("Landing");
  const tc = useTranslations("Common");

  return (
    <header className="landing-nav">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link
          href="/"
          className="shrink-0 text-lg font-bold tracking-tight text-soil-brand"
        >
          {tc("appName")}
        </Link>

        <nav
          className="hidden items-center gap-5 text-sm font-medium text-text-muted-brand md:flex"
          aria-label="Landing sections"
        >
          {ANCHORS.map((a) => (
            <a
              key={a.href}
              href={a.href}
              className="hover:text-soil-brand"
            >
              {t(a.key)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LocaleSwitcher />
          {signedIn && dashboardHref ? (
            <Link
              href={dashboardHref}
              className="hidden rounded-lg border border-border-brand px-3 py-1.5 text-sm text-text-brand hover:bg-surface-brand sm:inline-flex"
            >
              {t("goToApp")}
            </Link>
          ) : !signedIn ? (
            <Link
              href="/login"
              className="hidden rounded-lg border border-border-brand px-3 py-1.5 text-sm text-text-brand hover:bg-surface-brand sm:inline-flex"
            >
              {tc("signIn")}
            </Link>
          ) : null}
          <Link
            href={signedIn && dashboardHref ? dashboardHref : "/login"}
            className="rounded-lg bg-primary-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-hover-brand sm:px-4"
          >
            {t("navGetStarted")}
          </Link>
        </div>
      </div>
    </header>
  );
}
