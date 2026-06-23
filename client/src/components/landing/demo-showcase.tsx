import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/landing/section-heading";

export async function DemoShowcaseSection() {
  const t = await getTranslations("Landing");

  const steps = [
    { label: t("demoStep1"), color: "bg-soil-brand/15 text-soil-brand" },
    { label: t("demoStep2"), color: "bg-primary-brand/15 text-primary-brand" },
    { label: t("demoStep3"), color: "bg-growth-brand/15 text-growth-brand" },
    { label: t("demoStep4"), color: "bg-warning-brand/15 text-warning-brand" },
  ];

  return (
    <section id="demo" className="section-pad">
      <SectionHeading
        eyebrow={t("demoEyebrow")}
        title={t("demoTitle")}
        subtitle={t("demoSubtitle")}
      />

      <div className="overflow-hidden rounded-2xl border border-border-brand bg-surface-brand shadow-sm">
        <div className="aspect-video max-h-[420px] w-full bg-gradient-to-br from-bg-brand via-surface-brand to-growth-brand/10 p-6 sm:p-10">
          <div className="flex h-full flex-col justify-between">
            <div className="flex flex-wrap gap-2">
              {steps.map((s) => (
                <span
                  key={s.label}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${s.color}`}
                >
                  {s.label}
                </span>
              ))}
            </div>
            <div className="mx-auto w-full max-w-lg rounded-xl border border-border-brand bg-surface-brand/95 p-5 shadow-sm backdrop-blur-sm">
              <p className="text-center text-sm font-medium text-soil-brand">
                {t("demoPlaceholder")}
              </p>
              <p className="mt-2 text-center text-xs text-text-muted-brand">
                {t("demoPlaceholderHint")}
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <a
                href="#how-it-works"
                className="rounded-lg bg-primary-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover-brand"
              >
                {t("ctaWatchDemo")}
              </a>
              <a
                href="/courses"
                className="rounded-lg border border-border-brand px-5 py-2.5 text-sm font-medium text-text-brand hover:bg-bg-brand"
              >
                {t("ctaBrowse")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
