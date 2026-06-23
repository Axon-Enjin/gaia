"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { setLocale } from "@/app/actions/locale";
import type { Locale } from "@/i18n/request";

/** Minimal EN / Filipino toggle. No client-side i18n bundle beyond next-intl. */
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

  const options: { code: Locale; label: string }[] = [
    { code: "en", label: t("english") },
    { code: "fil", label: t("filipino") },
  ];

  return (
    <div
      className="inline-flex rounded border border-gray-300 text-sm"
      role="group"
      aria-label="Language"
    >
      {options.map((opt) => (
        <button
          key={opt.code}
          type="button"
          onClick={() => choose(opt.code)}
          disabled={pending}
          aria-pressed={active === opt.code}
          className={
            "px-3 py-1 first:rounded-l last:rounded-r disabled:opacity-50 " +
            (active === opt.code
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-900 hover:bg-gray-100")
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
