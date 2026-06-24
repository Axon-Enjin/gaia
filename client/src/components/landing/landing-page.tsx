import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { getTranslations } from "next-intl/server";
import { LandingNav } from "@/components/landing/landing-nav";
import { HeroSection } from "@/components/landing/hero-section";
import { DemoShowcaseSection } from "@/components/landing/demo-showcase";
import { AboutSection } from "@/components/landing/about-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { TechStackSection } from "@/components/landing/tech-stack-section";
import { MockupsSection } from "@/components/landing/mockups-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { FaqSection } from "@/components/landing/faq-section";
import { ClosingCtaSection } from "@/components/landing/closing-cta-section";
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

      {/* {user && dashboardHref && (
        <div className="mx-auto w-full max-w-6xl px-6 pt-4">
          <Link
            href={dashboardHref}
            className="inline-flex rounded-lg bg-growth-brand/10 px-4 py-2 text-sm font-medium text-growth-brand hover:bg-growth-brand/20"
          >
            {t("goToApp")} →
          </Link>
        </div>
      )} */}

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-20 px-6 py-10 sm:gap-24 sm:py-14">
        <HeroSection />
        <DemoShowcaseSection />
        <AboutSection />
        <FeaturesSection />
        <TechStackSection />
        <MockupsSection />
        <HowItWorksSection />
        <FaqSection />
        <ClosingCtaSection />
      </main>

      <footer className="mt-auto border-t border-border-brand bg-surface-brand/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-muted-brand">{t("footerPrivacy")}</p>
          <nav className="flex flex-wrap gap-4 text-sm">
            {user ? (
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="text-text-muted-brand hover:text-text-brand"
                >
                  {tc("signOut")}
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                className="font-medium text-primary-brand hover:text-primary-hover-brand"
              >
                {t("footerSignUp")}
              </Link>
            )}
            <Link
              href="/courses"
              className="text-text-muted-brand hover:text-text-brand"
            >
              {t("ctaBrowse")}
            </Link>
            <Link
              href="/teacher"
              className="text-text-muted-brand hover:text-text-brand"
            >
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
