import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/landing/section-heading";
import { Reveal } from "@/components/landing/reveal";
import { IconUpload, IconBook, IconShieldCheck } from "@/components/icons";

export async function DemoShowcaseSection() {
  const t = await getTranslations("Landing");

  const stages = [
    {
      Icon: IconUpload,
      step: t("demoStep1"),
      title: t("demoTourUploadTitle"),
      desc: t("demoTourUploadDesc"),
      tone: "soil" as const,
      Visual: UploadVisual,
    },
    {
      Icon: IconBook,
      step: t("demoStep3"),
      title: t("demoTourLearnTitle"),
      desc: t("demoTourLearnDesc"),
      tone: "growth" as const,
      Visual: LearnVisual,
    },
    {
      Icon: IconShieldCheck,
      step: t("demoStep4"),
      title: t("demoTourVerifyTitle"),
      desc: t("demoTourVerifyDesc"),
      tone: "primary" as const,
      Visual: VerifyVisual,
    },
  ];

  const toneText = {
    soil: "text-soil-brand",
    growth: "text-growth-strong-brand",
    primary: "text-primary-brand",
  };

  return (
    <section id="demo" className="section-pad">
      <SectionHeading
        eyebrow={t("demoEyebrow")}
        title={t("demoTitle")}
        subtitle={t("demoSubtitle")}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {stages.map((s, i) => (
          <Reveal
            as="article"
            key={s.title}
            delay={i * 90}
            className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border-brand bg-surface-brand shadow-[var(--shadow-sm)]"
          >
            <div className="border-b border-border-brand bg-bg-brand/50 p-5">
              <s.Visual />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-5">
              <span
                className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${toneText[s.tone]}`}
              >
                <s.Icon aria-hidden="true" />
                {String(i + 1).padStart(2, "0")} · {s.step}
              </span>
              <h3 className="display-font text-lg font-bold text-soil-brand">
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-muted-brand">
                {s.desc}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function UploadVisual() {
  return (
    <div className="flex h-28 items-center justify-center" aria-hidden>
      <div className="w-full max-w-[12rem] rounded-lg border-2 border-dashed border-soil-brand/30 bg-surface-brand p-4 text-center">
        <div className="mx-auto mb-2 h-8 w-8 rounded-md bg-soil-brand/15" />
        <div className="mx-auto h-2 w-2/3 rounded bg-border-brand" />
        <div className="mx-auto mt-1.5 h-2 w-1/2 rounded bg-border-brand" />
      </div>
    </div>
  );
}

function LearnVisual() {
  return (
    <div className="flex h-28 flex-col justify-center gap-2" aria-hidden>
      <div className="h-2.5 w-3/4 rounded bg-soil-brand/15" />
      <div className="h-2.5 w-full rounded bg-border-brand" />
      <div className="h-2.5 w-5/6 rounded bg-border-brand" />
      <div className="progress-track mt-1">
        <div className="progress-fill" style={{ width: "66%" }} />
      </div>
    </div>
  );
}

function VerifyVisual() {
  return (
    <div className="flex h-28 items-center justify-center gap-3" aria-hidden>
      <div className="grid h-16 w-16 grid-cols-4 grid-rows-4 gap-0.5 rounded-md border border-border-brand bg-surface-brand p-1.5">
        {Array.from({ length: 16 }).map((_, i) => (
          <span
            key={i}
            className={`rounded-[1px] ${i % 3 === 0 ? "bg-soil-brand/80" : "bg-soil-brand/15"}`}
          />
        ))}
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-growth-brand/40 bg-growth-brand/10 px-3 py-1.5 text-xs font-semibold text-growth-strong-brand">
        Verified
      </span>
    </div>
  );
}
