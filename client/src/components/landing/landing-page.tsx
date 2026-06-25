import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { getTranslations } from "next-intl/server";
import { LandingNav } from "@/components/landing/landing-nav";
import { HeroSection } from "@/components/landing/hero-section";
import { JourneySection } from "@/components/landing/journey-section";
import { TrustBandSection } from "@/components/landing/trust-band-section";
import { FaqSection } from "@/components/landing/faq-section";
import { ClosingCtaSection } from "@/components/landing/closing-cta-section";
import { BrandMark } from "@/components/brand/brand-mark";
import { getSessionDashboardHref } from "@/lib/auth/dashboard-href";
import { signOutAction } from "@/app/actions/auth";

interface LandingPageProps {
  user: User | null;
  dashboardHref: string | null;
}

export async function LandingPage({ user, dashboardHref }: LandingPageProps) {
  const t = await getTranslations("Landing");
  const tc = await getTranslations("Common");

  return (
    <div className="weave-bg flex min-h-full flex-col">
      <LandingNav signedIn={!!user} dashboardHref={dashboardHref} />

      <main
        id="main-content"
        className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-8 sm:gap-14 sm:py-10"
      >
        <HeroSection />
        <JourneySection />
        <TrustBandSection />
        <FaqSection />
        <ClosingCtaSection />
      </main>

      <footer className="mt-auto border-t border-border-brand bg-surface-brand/80">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex max-w-sm flex-col gap-2">
            <span className="brand-lockup">
              <BrandMark className="brand-lockup-mark" aria-hidden="true" />
              <span className="brand-lockup-word">{tc("appName")}</span>
            </span>
            <p className="text-sm leading-relaxed text-text-muted-brand">
              {t("tagline")} — {t("heroTaglineSub")}
            </p>
            <p className="text-xs text-text-muted-brand">{t("footerPrivacy")}</p>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm">
            {user ? (
              <form action={signOutAction}>
                <button type="submit" className="btn btn-ghost btn-sm">
                  {tc("signOut")}
                </button>
              </form>
            ) : (
              <Link href="/login" className="btn btn-ghost btn-sm">
                {t("footerSignUp")}
              </Link>
            )}
            <Link href="/courses" className="btn btn-ghost btn-sm">
              {t("ctaBrowse")}
            </Link>
            <Link href="/teacher" prefetch={false} className="btn btn-ghost btn-sm">
              {t("ctaTeacher")}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

/** Resolve dashboard link for signed-in users. */
export async function resolveDashboardHref(): Promise<{
  user: User | null;
  dashboardHref: string | null;
}> {
  return getSessionDashboardHref();
}
