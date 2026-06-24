import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  IconArrowRight,
  IconGlobe,
  IconShieldCheck,
  IconSprout,
} from "@/components/icons";

const CHIP_ICONS = [IconGlobe, IconSprout, IconShieldCheck];

export async function HeroSection() {
  const t = await getTranslations("Landing");

  const chips = [t("chipSub3G"), t("chipFilipino"), t("chipCredentials")];

  return (
    <section className="section-pad grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
      <div className="reveal is-visible flex flex-col gap-4">
        <p className="eyebrow">{t("heroEyebrow")}</p>

        <h1 className="display-font text-3xl font-bold leading-[1.12] text-soil-brand sm:text-4xl">
          {t("heroTagline")}
        </h1>
        <p className="text-sm font-medium text-growth-strong-brand">
          {t("heroTaglineSub")}
        </p>

        <p className="max-w-lg text-base leading-relaxed text-text-muted-brand">
          {t("heroBody")}
        </p>

        <div className="flex flex-wrap gap-2.5 pt-1">
          <Link href="/login" className="btn btn-primary">
            {t("ctaSignUp")}
            <IconArrowRight />
          </Link>
          <a href="#journey" className="btn btn-secondary">
            {t("ctaWatchDemo")}
          </a>
        </div>

        <ul className="flex flex-wrap gap-2">
          {chips.map((chip, i) => {
            const Icon = CHIP_ICONS[i] ?? IconSprout;
            return (
              <li
                key={chip}
                className="inline-flex items-center gap-1.5 rounded-full border border-growth-brand/25 bg-growth-brand/10 px-3 py-1 text-xs font-semibold text-growth-strong-brand"
              >
                <Icon aria-hidden="true" />
                {chip}
              </li>
            );
          })}
        </ul>
      </div>

      <HeroPreview />
    </section>
  );
}

/** Decorative product preview — a learner finishing a lesson and earning XP. */
function HeroPreview() {
  return (
    <div
      className="relative overflow-hidden rounded-[var(--radius-surface)] border border-border-brand bg-surface-brand p-4 shadow-[var(--shadow-sm)] sm:p-5"
      aria-hidden
    >
      <div className="rounded-[var(--radius-control)] border border-border-brand bg-bg-brand/60 p-3.5">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-growth-strong-brand">
          Lesson 3 of 4
        </p>
        <div className="mt-2 space-y-1.5">
          <div className="h-2.5 w-3/4 rounded bg-soil-brand/15" />
          <div className="h-2.5 w-full rounded bg-border-brand" />
          <div className="h-2.5 w-5/6 rounded bg-border-brand" />
        </div>
        <div className="progress-track mt-3">
          <div className="progress-fill" style={{ width: "75%" }} />
        </div>
      </div>

      <div className="mt-2.5 grid grid-cols-3 gap-1.5">
        <div className="rounded-md border border-growth-brand/30 bg-growth-brand/10 px-2 py-2 text-center">
          <div className="text-sm font-bold text-growth-strong-brand">+48</div>
          <div className="text-[0.5625rem] font-semibold uppercase tracking-wide text-text-muted-brand">
            XP
          </div>
        </div>
        <div className="rounded-md border border-warning-brand/30 bg-warning-brand/10 px-2 py-2 text-center">
          <div className="text-sm font-bold text-warning-brand">5</div>
          <div className="text-[0.5625rem] font-semibold uppercase tracking-wide text-text-muted-brand">
            Streak
          </div>
        </div>
        <div className="rounded-md border border-primary-brand/30 bg-primary-brand/10 px-2 py-2 text-center">
          <div className="text-sm font-bold text-primary-brand">VC</div>
          <div className="text-[0.5625rem] font-semibold uppercase tracking-wide text-text-muted-brand">
            Verified
          </div>
        </div>
      </div>
    </div>
  );
}
