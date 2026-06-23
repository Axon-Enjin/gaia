import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function HeroSection() {
  const t = await getTranslations("Landing");

  const chips = [
    t("chipSub3G"),
    t("chipFilipino"),
    t("chipCredentials"),
  ];

  return (
    <section className="section-pad grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
      <div className="flex flex-col gap-6">
        <p className="text-sm font-medium uppercase tracking-wide text-growth-brand">
          {t("heroEyebrow")}
        </p>
        <h1 className="text-4xl font-bold leading-tight text-soil-brand sm:text-5xl">
          {t("heroTitle")}
        </h1>
        <p className="text-lg leading-relaxed text-text-muted-brand">
          {t("heroBody")}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center rounded-lg bg-primary-brand px-6 font-medium text-white hover:bg-primary-hover-brand"
          >
            {t("ctaSignUp")}
          </Link>
          <a
            href="#demo"
            className="inline-flex min-h-11 items-center rounded-lg border border-border-brand bg-surface-brand px-6 font-medium text-text-brand hover:border-soil-brand/40"
          >
            {t("ctaWatchDemo")}
          </a>
        </div>
        <ul className="flex flex-wrap gap-2 pt-1">
          {chips.map((chip) => (
            <li
              key={chip}
              className="rounded-full border border-growth-brand/25 bg-growth-brand/10 px-3 py-1 text-xs font-medium text-growth-brand"
            >
              {chip}
            </li>
          ))}
        </ul>
      </div>

      <div
        className="relative overflow-hidden rounded-2xl border border-border-brand bg-surface-brand p-6 shadow-sm"
        aria-hidden
      >
        <div className="mb-4 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-error-brand/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning-brand/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-success-brand/70" />
        </div>
        <div className="space-y-3">
          <div className="h-3 w-3/4 rounded bg-soil-brand/15" />
          <div className="h-3 w-full rounded bg-border-brand" />
          <div className="h-3 w-5/6 rounded bg-border-brand" />
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-growth-brand/30 bg-growth-brand/10 p-3 text-center text-xs font-semibold text-growth-brand">
              XP
            </div>
            <div className="rounded-lg border border-primary-brand/30 bg-primary-brand/10 p-3 text-center text-xs font-semibold text-primary-brand">
              VC
            </div>
            <div className="rounded-lg border border-soil-brand/30 bg-soil-brand/10 p-3 text-center text-xs font-semibold text-soil-brand">
              AI
            </div>
          </div>
          <div className="h-24 rounded-lg border border-dashed border-border-brand bg-bg-brand" />
        </div>
      </div>
    </section>
  );
}
