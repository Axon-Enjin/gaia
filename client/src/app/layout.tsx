import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { messagesForLocale } from "@/i18n/messages";
import { HtmlLangSync } from "@/components/html-lang-sync";
import type { Locale } from "@/i18n/request";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const tCommon = await getTranslations("Common");
  const tLanding = await getTranslations("Landing");
  const appName = tCommon("appName");

  return {
    metadataBase: new URL("https://aniskwela.app"),
    title: {
      default: tCommon("metaTitle"),
      template: `%s · ${appName}`,
    },
    description: tCommon("metaDescription"),
    applicationName: appName,
    openGraph: {
      type: "website",
      siteName: appName,
      title: tCommon("metaTitle"),
      description: tLanding("techSubtitle"),
      images: [{ url: "/brand/og.svg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: tCommon("metaTitle"),
      description: tCommon("metaTwitterDescription"),
      images: ["/brand/og.svg"],
    },
  };
}

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
