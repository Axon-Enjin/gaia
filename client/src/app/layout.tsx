import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gaia — Learn. Earn credentials. Grow.",
  description:
    "AI-powered adaptive learning with standards-based, blockchain-anchored credentials.",
};

export const viewport: Viewport = {
  // Light theme only — hard low-resource constraint (AGENTS.md).
  themeColor: "#ffffff",
  colorScheme: "light",
};

/**
 * Cookie-dependent i18n provider. Isolated so the dynamic locale read stays
 * inside a <Suspense> boundary (required by Cache Components), keeping the
 * <html> shell static.
 */
async function IntlProvider({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
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
