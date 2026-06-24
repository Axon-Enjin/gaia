import en from "../../messages/en.json";
import fil from "../../messages/fil.json";
import type { Locale } from "./request";

const byLocale = { en, fil } as const satisfies Record<Locale, typeof en>;

export function messagesForLocale(locale: Locale) {
  return byLocale[locale];
}
