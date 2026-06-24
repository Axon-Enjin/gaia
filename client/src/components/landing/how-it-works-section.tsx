import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/landing/section-heading";
import { Reveal } from "@/components/landing/reveal";

export async function HowItWorksSection() {
  const t = await getTranslations("Landing");

  const steps = [
    { num: "01", title: t("flow1"), desc: t("flow1Desc") },
    { num: "02", title: t("flow2"), desc: t("flow2Desc") },
    { num: "03", title: t("flow3"), desc: t("flow3Desc") },
    { num: "04", title: t("flow4"), desc: t("flow4Desc") },
  ];

  return (
    <section id="how-it-works" className="section-pad">
      <SectionHeading
        eyebrow={t("flowEyebrow")}
        title={t("flowTitle")}
        subtitle={t("flowSubtitle")}
      />
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <Reveal
            as="li"
            key={s.num}
            delay={i * 70}
            className="relative rounded-[var(--radius-surface)] border border-border-brand bg-surface-brand p-5"
          >
            <span
              className="display-font mb-3 block text-4xl font-bold tabular-nums text-growth-brand/70"
              aria-hidden
            >
              {s.num}
            </span>
            <h3 className="mb-2 font-semibold text-soil-brand">{s.title}</h3>
            <p className="text-sm leading-relaxed text-text-muted-brand">
              {s.desc}
            </p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
