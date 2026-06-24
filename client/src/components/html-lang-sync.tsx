"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";

/**
 * Keeps <html lang> in sync with the active locale without forcing the static
 * shell dynamic (the root layout renders lang="en"; this corrects it on the
 * client when the learner is browsing in Filipino). Improves screen-reader
 * pronunciation — WCAG 3.1.1/3.1.2.
 */
export function HtmlLangSync() {
  const locale = useLocale();
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);
  return null;
}
