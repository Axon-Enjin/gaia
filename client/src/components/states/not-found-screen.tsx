"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { IconCompass } from "@/components/icons";

/**
 * Friendly 404 (EN/FIL). Always offers a way home so the learner is never
 * stranded — important on low-end devices with no browser chrome to fall back on.
 */
export function NotFoundScreen() {
  const t = useTranslations("States");
  return (
    <div className="site-container py-16 sm:py-24">
      <div className="empty-state mx-auto max-w-md">
        <span className="empty-state-icon" aria-hidden>
          <IconCompass />
        </span>
        <p className="empty-state-title">{t("notFoundTitle")}</p>
        <p className="empty-state-text">{t("notFoundBody")}</p>
        <Link href="/" className="btn btn-primary btn-sm">
          {t("goHome")}
        </Link>
      </div>
    </div>
  );
}
