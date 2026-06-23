import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/landing/section-heading";

function Pillar({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <article className="rounded-xl border border-border-brand bg-surface-brand p-6">
      <h3 className="mb-2 text-lg font-semibold text-soil-brand">{title}</h3>
      <p className="text-sm leading-relaxed text-text-muted-brand">{desc}</p>
    </article>
  );
}

export async function AboutSection() {
  const t = await getTranslations("Landing");

  return (
    <section className="section-pad rounded-2xl border border-border-brand bg-surface-brand/60 p-6 sm:p-10">
      <SectionHeading title={t("aboutTitle")} subtitle={t("aboutBody")} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Pillar title={t("aboutTeach")} desc={t("aboutTeachDesc")} />
        <Pillar title={t("aboutLearn")} desc={t("aboutLearnDesc")} />
        <Pillar title={t("aboutVerify")} desc={t("aboutVerifyDesc")} />
      </div>
    </section>
  );
}
