import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { WaitlistForm } from "@/components/landing/waitlist-form";

export async function ClosingCtaSection() {
  const t = await getTranslations("Landing");

  return (
    <section
      id="waitlist"
      className="section-pad overflow-hidden rounded-2xl border border-growth-brand/25 bg-gradient-to-br from-growth-brand/12 via-surface-brand to-primary-brand/8 p-6 sm:p-10"
    >
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-growth-brand">
          {t("closeEyebrow")}
        </p>
        <h2 className="mb-3 text-2xl font-bold text-soil-brand sm:text-3xl">
          {t("closeTitle")}
        </h2>
        <p className="mb-2 text-text-muted-brand">{t("closeSubtitle")}</p>
        <p className="mb-8 text-sm text-text-muted-brand">{t("closeLine")}</p>
      </div>
      <div className="mx-auto max-w-lg">
        <WaitlistForm />
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center rounded-lg bg-primary-brand px-6 font-medium text-white hover:bg-primary-hover-brand"
        >
          {t("ctaSignUp")}
        </Link>
        <Link
          href="/courses"
          className="inline-flex min-h-11 items-center rounded-lg border border-border-brand bg-surface-brand px-6 font-medium text-text-brand"
        >
          {t("ctaBrowse")}
        </Link>
      </div>
    </section>
  );
}
