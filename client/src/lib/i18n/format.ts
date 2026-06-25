import type { Locale } from "@/i18n/request";

function resolveLocale(locale: Locale | string): string {
  if (locale === "fil") return "fil-PH";
  if (locale === "en") return "en-US";
  return locale || "en-US";
}

export function formatLocaleDate(
  locale: Locale | string,
  value: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = value instanceof Date ? value : new Date(value);
  const resolved = resolveLocale(locale);
  return new Intl.DateTimeFormat(resolved, options).format(date);
}

export function formatLocaleNumber(
  locale: Locale | string,
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  const resolved = resolveLocale(locale);
  return new Intl.NumberFormat(resolved, options).format(value);
}
