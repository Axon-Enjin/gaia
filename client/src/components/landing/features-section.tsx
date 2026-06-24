import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/landing/section-heading";
import { Reveal } from "@/components/landing/reveal";

function FeatureCard({
  label,
  title,
  body,
  benefit,
  delay,
}: {
  label: string;
  title: string;
  body: string;
  benefit: string;
  delay: number;
}) {
  return (
    <Reveal
      as="article"
      delay={delay}
      className="group flex flex-col rounded-[var(--radius-surface)] border border-border-brand bg-surface-brand p-5 shadow-[var(--shadow-sm)] transition-[border-color,box-shadow] duration-150 hover:border-soil-brand/30 hover:shadow-[var(--shadow-md)]"
    >
      <span className="mb-3 w-fit rounded-full bg-soil-brand/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-soil-brand">
        {label}
      </span>
      <h3 className="display-font mb-2 text-lg font-bold text-soil-brand">
        {title}
      </h3>
      <p className="mb-4 flex-1 text-sm leading-relaxed text-text-muted-brand">
        {body}
      </p>
      <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-growth-brand/10 px-2 py-1 text-xs font-semibold text-growth-strong-brand">
        {benefit}
      </span>
    </Reveal>
  );
}

export async function FeaturesSection() {
  const t = await getTranslations("Landing");

  const features = [
    {
      label: t("feat1Label"),
      title: t("feat1Title"),
      body: t("feat1Body"),
      benefit: t("feat1Benefit"),
    },
    {
      label: t("feat2Label"),
      title: t("feat2Title"),
      body: t("feat2Body"),
      benefit: t("feat2Benefit"),
    },
    {
      label: t("feat3Label"),
      title: t("feat3Title"),
      body: t("feat3Body"),
      benefit: t("feat3Benefit"),
    },
    {
      label: t("feat4Label"),
      title: t("feat4Title"),
      body: t("feat4Body"),
      benefit: t("feat4Benefit"),
    },
    {
      label: t("feat5Label"),
      title: t("feat5Title"),
      body: t("feat5Body"),
      benefit: t("feat5Benefit"),
    },
    {
      label: t("feat6Label"),
      title: t("feat6Title"),
      body: t("feat6Body"),
      benefit: t("feat6Benefit"),
    },
  ];

  return (
    <section id="features" className="section-pad">
      <SectionHeading
        eyebrow={t("featuresEyebrow")}
        title={t("featuresTitle")}
        subtitle={t("featuresSubtitle")}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <FeatureCard key={f.title} {...f} delay={(i % 3) * 70} />
        ))}
      </div>
    </section>
  );
}
