"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { setLocale } from "@/app/actions/locale";
import type { Locale } from "@/i18n/request";

const OPTIONS: { code: Locale; short: string; labelKey: "english" | "filipino" }[] =
  [
    { code: "en", short: "EN", labelKey: "english" },
    { code: "fil", short: "FIL", labelKey: "filipino" },
  ];

/** Compact EN / FIL sliding-pill locale switcher. */
export function LocaleSwitcher() {
  const t = useTranslations("Common");
  const active = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(locale: Locale) {
    if (locale === active) return;
    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });
  }

  return (
    <div
      className={`locale-switch ${pending ? "is-pending" : ""}`}
      role="group"
      aria-label={t("localeGroup")}
    >
      <span
        className="locale-switch-thumb"
        data-locale={active}
        aria-hidden
      />
      {OPTIONS.map((opt) => (
        <button
          key={opt.code}
          type="button"
          onClick={() => choose(opt.code)}
          disabled={pending}
          className="locale-switch-option"
          aria-pressed={active === opt.code}
          aria-label={t(opt.labelKey)}
        >
          {opt.short}
        </button>
      ))}
    </div>
  );
}
