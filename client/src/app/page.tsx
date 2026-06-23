import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { getSessionUser } from "@/lib/auth";
import { signOutAction } from "@/app/actions/auth";

export default async function Home() {
  const t = await getTranslations("Common");
  const user = await getSessionUser();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <header className="flex items-center justify-between gap-4">
        <span className="text-lg font-semibold">{t("appName")}</span>
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          {user ? (
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
              >
                {t("signOut")}
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
            >
              {t("signIn")}
            </Link>
          )}
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{t("appName")}</h1>
        <p className="text-lg text-gray-700">{t("tagline")}</p>
        <div className="flex gap-3">
          <Link
            href="/courses"
            className="inline-block rounded border border-gray-300 px-5 py-2.5 hover:bg-gray-100"
          >
            Browse courses
          </Link>
          <Link
            href="/teacher"
            className="inline-block rounded bg-gray-900 px-5 py-2.5 text-white hover:bg-gray-800"
          >
            Teacher dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
