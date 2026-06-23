import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/locale-switcher";

export default async function Home() {
  const t = await getTranslations("Common");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <header className="flex items-center justify-between">
        <span className="text-lg font-semibold">{t("appName")}</span>
        <LocaleSwitcher />
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
