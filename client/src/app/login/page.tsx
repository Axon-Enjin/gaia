import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { ensureProfile, getSessionUser } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { BrandMark } from "@/components/brand/brand-mark";

type Search = { mode?: string };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await connection();
  const user = await getSessionUser();
  if (user) {
    const profile = await ensureProfile();
    if (profile?.role === "teacher") redirect("/teacher");
    if (profile?.role === "learner") redirect("/learner");
    redirect("/courses");
  }

  const t = await getTranslations("Auth");
  const tl = await getTranslations("Landing");
  const ts = await getTranslations("States");
  const { mode } = await searchParams;
  const isSignUp = mode === "sign-up";

  return (
    <div className="min-h-screen w-full flex flex-col lg:grid lg:grid-cols-[45%_55%] xl:grid-cols-[40%_60%] bg-surface-brand">
      
      {/* Left side: Soil Brand Showcase Panel */}
      <div 
        className="hidden lg:flex flex-col justify-between pl-16 xl:pl-24 pr-12 py-12 relative text-bg-brand border-r border-border-brand/20 overflow-hidden"
        style={{
          backgroundImage: `
            radial-gradient(circle at top left, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
            repeating-linear-gradient(90deg, transparent, transparent 11px, rgba(255, 255, 255, 0.015) 11px, rgba(255, 255, 255, 0.015) 12px),
            repeating-linear-gradient(0deg, transparent, transparent 11px, rgba(255, 255, 255, 0.01) 11px, rgba(255, 255, 255, 0.01) 12px)
          `,
          backgroundColor: "var(--color-soil)"
        }}
      >
        {/* Top brand header */}
        <div className="flex items-center gap-2">
          <BrandMark className="h-6 w-6 text-growth-brand" aria-hidden="true" />
          <span className="text-lg font-bold tracking-tight display-font text-white">{t("appName")}</span>
        </div>

        {/* Center brand block */}
        <div className="max-w-md my-auto flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 border border-white/20 shadow-inner">
              <BrandMark className="h-12 w-12 text-growth-brand" aria-hidden="true" />
            </span>
            <div className="flex flex-col">
              <span className="text-3xl font-extrabold tracking-tight display-font text-white">{t("appName")}</span>
              <span className="text-xs uppercase tracking-widest text-growth-brand font-bold">Harvester School</span>
            </div>
          </div>

          <div className="h-[2px] w-24 bg-growth-brand rounded" />

          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-growth-brand">
              {tl("heroEyebrow")}
            </p>
            <h2 className="text-3xl font-bold display-font tracking-tight text-white leading-tight">
              {tl("heroTagline")}
            </h2>
            <p className="text-sm font-medium text-growth-brand">
              {tl("heroTaglineSub")}
            </p>
            <p className="text-sm leading-relaxed text-bg-brand/90 mt-2">
              {tl("heroBody")}
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-bg-brand/60">
          Aniskwela · 2026
        </div>
      </div>

      {/* Right side: Light Authentication Form Panel */}
      <div className="flex-1 flex flex-col justify-between min-h-screen bg-bg-brand/30 weave-bg p-6 lg:p-12">
        {/* Header with Locale switcher */}
        <div className="flex items-center justify-between lg:justify-end gap-4 w-full">
          <Link href="/" className="lg:hidden flex items-center gap-2 site-brand brand-lockup">
            <BrandMark className="brand-lockup-mark" aria-hidden="true" />
            <span>{t("appName")}</span>
          </Link>
          <LocaleSwitcher />
        </div>

        {/* Centered Login Card */}
        <div className="mx-auto my-auto w-full max-w-md flex flex-col items-center gap-6 py-8">
          <div className="w-full bg-white p-6 sm:p-8 rounded-2xl border border-border-brand/40 shadow-md">
            <div className="mb-6 flex flex-col items-start gap-2">
              <span className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-growth-brand/10 mb-2">
                <BrandMark className="h-6 w-6 text-growth-brand" aria-hidden="true" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-soil-brand display-font">
                {isSignUp ? t("signUpTitle") : t("signInTitle")}
              </h1>
              <p className="text-sm text-text-muted-brand">
                {isSignUp ? tl("waitlistConsent") : tl("heroTaglineSub")}
              </p>
            </div>

            <AuthForm
              key={isSignUp ? "sign-up" : "sign-in"}
              mode={isSignUp ? "sign-up" : "sign-in"}
            />

            <div className="mt-6 pt-5 border-t border-border-brand/30 text-center">
              <p className="text-sm text-text-muted-brand">
                {isSignUp ? (
                  <>
                    {t("haveAccount")}{" "}
                    <Link
                      href="/login"
                      className="font-semibold text-primary-brand hover:underline"
                    >
                      {t("signIn")}
                    </Link>
                  </>
                ) : (
                  <>
                    {t("noAccount")}{" "}
                    <Link
                      href="/login?mode=sign-up"
                      className="font-semibold text-primary-brand hover:underline"
                    >
                      {t("signUp")}
                    </Link>
                  </>
                )}
              </p>
            </div>
          </div>

          <Link href="/" className="text-sm text-text-muted-brand hover:text-soil-brand flex items-center gap-1 transition">
            ← {ts("goHome")}
          </Link>
        </div>

        {/* Footer/Legal text for mobile/desktop */}
        <div className="text-center lg:text-right text-xs text-text-muted-brand">
          {t("appName")} © 2026
        </div>
      </div>

    </div>
  );
}
