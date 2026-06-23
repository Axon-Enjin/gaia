import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/landing/section-heading";

function TechLayer({
  name,
  role,
  desc,
}: {
  name: string;
  role: string;
  desc: string;
}) {
  return (
    <article className="rounded-xl border border-border-brand bg-surface-brand p-5">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary-brand">
        {role}
      </p>
      <h3 className="mb-2 text-lg font-semibold text-soil-brand">{name}</h3>
      <p className="text-sm leading-relaxed text-text-muted-brand">{desc}</p>
    </article>
  );
}

export async function TechStackSection() {
  const t = await getTranslations("Landing");

  return (
    <section className="section-pad rounded-2xl border border-border-brand bg-gradient-to-b from-surface-brand to-bg-brand p-6 sm:p-10">
      <SectionHeading
        eyebrow={t("techEyebrow")}
        title={t("techTitle")}
        subtitle={t("techSubtitle")}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <TechLayer
          name={t("tech1Name")}
          role={t("tech1Role")}
          desc={t("tech1Desc")}
        />
        <TechLayer
          name={t("tech2Name")}
          role={t("tech2Role")}
          desc={t("tech2Desc")}
        />
        <TechLayer
          name={t("tech3Name")}
          role={t("tech3Role")}
          desc={t("tech3Desc")}
        />
      </div>
    </section>
  );
}
