import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { WaitlistForm } from "@/components/landing/waitlist-form";

export async function ClosingCtaSection() {
  const t = await getTranslations("Landing");

  return (
    <section
      id="waitlist"
      className="section-pad rounded-[var(--radius-surface)] border border-border-brand bg-surface-brand px-5 py-6 sm:px-8 sm:py-8"
    >
      <div className="mx-auto max-w-xl text-center">
        <p className="eyebrow mb-3 justify-center">{t("closeEyebrow")}</p>
        <h2 className="display-font text-2xl font-bold text-soil-brand sm:text-3xl">
          {t("closeTitle")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-text-muted-brand">
          {t("closeSubtitle")}
        </p>
      </div>
      <div className="mx-auto mt-6 max-w-lg">
        <WaitlistForm />
      </div>
      <p className="mt-5 text-center">
        <Link href="/courses" className="btn btn-ghost btn-sm">
          {t("closeBrowseLink")}
        </Link>
      </p>
    </section>
  );
}
