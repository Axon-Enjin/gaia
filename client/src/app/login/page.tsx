import Link from "next/link";
import { redirect } from "next/navigation";
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
  const user = await getSessionUser();
  if (user) {
    const profile = await ensureProfile();
    if (profile?.role === "teacher") redirect("/teacher");
    if (profile?.role === "learner") redirect("/learner");
    redirect("/courses");
  }

  const t = await getTranslations("Auth");
  const tl = await getTranslations("Landing");
  const tagline = tl("heroTaglineSub");
  const { mode } = await searchParams;
  const isSignUp = mode === "sign-up";

  return (
    <div className="product-page flex min-h-full flex-col">
      <header className="site-header">
        <div className="site-header-inner site-header-inner--product">
          <Link href="/" className="site-brand brand-lockup">
            <BrandMark className="brand-lockup-mark" aria-hidden="true" />
            <span>{t("appName")}</span>
          </Link>
          <div className="site-header-actions">
            <LocaleSwitcher />
          </div>
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-12"
      >
        <div
          className="rounded-[var(--radius-lg)] border border-border-brand bg-surface-brand p-6 shadow-[var(--shadow-md)] sm:p-8"
        >
          <div className="mb-6 flex flex-col items-start gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] bg-growth-brand/10">
              <BrandMark className="h-6 w-6" aria-hidden="true" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-soil-brand">
              {isSignUp ? t("signUpTitle") : t("signInTitle")}
            </h1>
            <p className="text-sm text-text-muted-brand">{tagline}</p>
          </div>

          <AuthForm mode={isSignUp ? "sign-up" : "sign-in"} />

          <p className="mt-5 text-sm text-text-muted-brand">
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
      </main>
    </div>
  );
}
