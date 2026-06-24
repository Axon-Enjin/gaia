"use client";

import { useTranslations } from "next-intl";

/**
 * Branded route-transition fallback (DSD §5 — 1.5s shimmer). Renders a
 * skeleton scaffold that mirrors a typical product page so the layout doesn't
 * jump when content arrives. Lightweight: pure CSS shimmer, no JS animation.
 */
export function LoadingScreen() {
  const t = useTranslations("States");
  return (
    <div className="site-container py-10 sm:py-14" role="status" aria-busy="true">
      <span className="sr-only">{t("loading")}</span>
      <div className="mx-auto max-w-3xl">
        <div className="skeleton skeleton-text" style={{ width: "30%" }} />
        <div
          className="skeleton skeleton-line mt-3"
          style={{ width: "60%", height: "1.75rem" }}
        />
        <div className="skeleton skeleton-text mt-4" style={{ width: "80%" }} />

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-[var(--radius-surface)] border border-border-brand bg-surface-brand p-5"
            >
              <div className="skeleton skeleton-line" style={{ width: "70%" }} />
              <div
                className="skeleton skeleton-text mt-3"
                style={{ width: "100%" }}
              />
              <div
                className="skeleton skeleton-text mt-2"
                style={{ width: "85%" }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
