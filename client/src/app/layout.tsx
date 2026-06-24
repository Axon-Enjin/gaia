import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { messagesForLocale } from "@/i18n/messages";
import { HtmlLangSync } from "@/components/html-lang-sync";
import type { Locale } from "@/i18n/request";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://aniskwela.app"),
  title: {
    default: "Aniskwela — Learning that grows with you",
    template: "%s · Aniskwela",
  },
  description:
    "Magsaka. Mag-aral. Mag-ani ng patunay. AI-built farming courses that run on the slowest phone, with credentials the world can verify — yours to keep.",
  applicationName: "Aniskwela",
  openGraph: {
    type: "website",
    siteName: "Aniskwela",
    title: "Aniskwela — Learning that grows with you",
    description:
      "Farm. Learn. Harvest the proof. AI-built courses for Filipino farmers, with blockchain-anchored, verifiable credentials — built for low-bandwidth phones.",
    images: [{ url: "/brand/og.svg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aniskwela — Learning that grows with you",
    description:
      "Farm. Learn. Harvest the proof. Verifiable credentials, built for low-bandwidth learners.",
    images: ["/brand/og.svg"],
  },
};

export const viewport: Viewport = {
  // Light theme only — hard low-resource constraint (AGENTS.md).
  themeColor: "#FBF8F2",
  colorScheme: "light",
};

/**
 * Cookie-dependent i18n provider. Isolated so the dynamic locale read stays
 * inside a <Suspense> boundary (required by Cache Components), keeping the
 * <html> shell static.
 */
async function IntlProvider({ children }: { children: React.ReactNode }) {
  const locale = (await getLocale()) as Locale;
  const messages = messagesForLocale(locale);
  const t = await getTranslations("Common");
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <HtmlLangSync />
      <a href="#main-content" className="skip-link">
        {t("skipToContent")}
      </a>
      {children}
    </NextIntlClientProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // `lang` stays "en" in the static shell; visible copy still localizes via the
  // provider below. Per-locale <html lang> would force the whole shell dynamic.
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <Suspense>
          <IntlProvider>{children}</IntlProvider>
        </Suspense>
      </body>
    </html>
  );
}
