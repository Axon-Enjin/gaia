import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { messagesForLocale } from "./messages";

export const locales = ["en", "fil"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const LOCALE_COOKIE = "aniskwela_locale";

function isLocale(value: string | undefined): value is Locale {
  return value === "en" || value === "fil";
}

// No i18n routing: locale comes from a cookie (PRD-F: EN + Filipino toggle).
export default getRequestConfig(async () => {
  const store = await cookies();
  const cookieLocale = store.get(LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;

  return {
    locale,
    messages: messagesForLocale(locale),
  };
});
