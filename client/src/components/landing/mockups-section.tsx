import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/landing/section-heading";

function ScreenMock({
  label,
  title,
  desc,
  variant,
}: {
  label: string;
  title: string;
  desc: string;
  variant: "upload" | "lesson" | "credential";
}) {
  return (
    <article className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border border-border-brand bg-surface-brand shadow-sm">
        <div className="border-b border-border-brand bg-bg-brand px-4 py-2 text-xs font-medium text-text-muted-brand">
          Aniskwela
        </div>
        <div className="space-y-2 p-4">
          {variant === "upload" && (
            <>
              <div className="rounded-lg border border-dashed border-primary-brand/40 bg-primary-brand/5 p-6 text-center text-xs text-primary-brand">
                PDF / document
              </div>
              <div className="h-2 w-full rounded bg-border-brand" />
              <div className="h-2 w-4/5 rounded bg-border-brand" />
            </>
          )}
          {variant === "lesson" && (
            <>
              <div className="h-2 w-1/3 rounded bg-growth-brand/30" />
              <div className="h-2 w-full rounded bg-border-brand" />
              <div className="h-2 w-full rounded bg-border-brand" />
              <div className="mt-2 h-8 rounded-lg bg-growth-brand/15" />
            </>
          )}
          {variant === "credential" && (
            <>
              <div className="rounded-lg border border-growth-brand/30 bg-growth-brand/10 p-4">
                <div className="h-2 w-1/2 rounded bg-growth-brand/40" />
                <div className="mt-3 h-2 w-full rounded bg-border-brand" />
                <div className="mt-1 h-2 w-2/3 rounded bg-border-brand" />
              </div>
              <div className="flex gap-2">
                <div className="h-6 flex-1 rounded bg-primary-brand/20" />
                <div className="h-6 w-6 rounded bg-border-brand" />
              </div>
            </>
          )}
        </div>
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-growth-brand">
          {label}
        </p>
        <h3 className="mb-1 font-semibold text-soil-brand">{title}</h3>
        <p className="text-sm text-text-muted-brand">{desc}</p>
      </div>
    </article>
  );
}

export async function MockupsSection() {
  const t = await getTranslations("Landing");

  return (
    <section className="section-pad">
      <SectionHeading
        eyebrow={t("mockupsEyebrow")}
        title={t("mockupsTitle")}
        subtitle={t("mockupsSubtitle")}
      />
      <div className="grid gap-8 md:grid-cols-3">
        <ScreenMock
          label={t("mock1Label")}
          title={t("mock1Title")}
          desc={t("mock1Desc")}
          variant="upload"
        />
        <ScreenMock
          label={t("mock2Label")}
          title={t("mock2Title")}
          desc={t("mock2Desc")}
          variant="lesson"
        />
        <ScreenMock
          label={t("mock3Label")}
          title={t("mock3Title")}
          desc={t("mock3Desc")}
          variant="credential"
        />
      </div>
    </section>
  );
}
