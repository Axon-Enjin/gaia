"use client";

import { useTranslations } from "next-intl";
import { IconRefresh } from "@/components/icons";

interface ErrorScreenProps {
  reset: () => void;
}

/**
 * Friendly, reassuring error surface for App Router `error.tsx` boundaries.
 * Avoids leaking internals; reassures the learner their progress is safe.
 */
export function ErrorScreen({ reset }: ErrorScreenProps) {
  const t = useTranslations("States");
  return (
    <div className="site-container py-16 sm:py-24">
      <div className="empty-state mx-auto max-w-md">
        <span className="empty-state-icon" aria-hidden>
          <IconRefresh />
        </span>
        <p className="empty-state-title">{t("errorTitle")}</p>
        <p className="empty-state-text">{t("errorBody")}</p>
        <button type="button" onClick={reset} className="btn btn-primary btn-sm">
          {t("retry")}
        </button>
      </div>
    </div>
  );
}
