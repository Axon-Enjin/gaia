import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Cache Components: enables the explicit, opt-in `'use cache'` directive
  // (AGENTS.md guardrail — no implicit fetch caching).
  cacheComponents: true,
  // Low-resource constraint (AGENTS.md): keep first-load JS small.
  // Images must be served as small WebP (<= 80KB) — enforced in review, not here.
  images: {
    formats: ["image/webp"],
  },
  // pdf-parse reads files at runtime; keep it out of the bundler.
  serverExternalPackages: ["pdf-parse"],
};

// Links src/i18n/request.ts to next-intl (cookie-based locale, no i18n routing).
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
