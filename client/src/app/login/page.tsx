import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getSessionUser } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";
import { LocaleSwitcher } from "@/components/locale-switcher";

type Search = { mode?: string };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  // Already signed in? Send to the catalog.
  if (await getSessionUser()) {
    redirect("/courses");
  }

  const t = await getTranslations("Auth");
  const { mode } = await searchParams;
  const isSignUp = mode === "sign-up";

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-8 px-6 py-16">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold">
          {t("appName")}
        </Link>
        <LocaleSwitcher />
      </header>

      <section className="flex flex-col gap-5">
        <h1 className="text-2xl font-bold tracking-tight">
          {isSignUp ? t("signUpTitle") : t("signInTitle")}
        </h1>

        <AuthForm mode={isSignUp ? "sign-up" : "sign-in"} />

        <p className="text-sm text-gray-600">
          {isSignUp ? (
            <>
              {t("haveAccount")}{" "}
              <Link href="/login" className="font-medium underline">
                {t("signIn")}
              </Link>
            </>
          ) : (
            <>
              {t("noAccount")}{" "}
              <Link href="/login?mode=sign-up" className="font-medium underline">
                {t("signUp")}
              </Link>
            </>
          )}
        </p>
      </section>
    </main>
  );
}
