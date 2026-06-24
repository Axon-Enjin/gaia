import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/landing/section-heading";
import { Reveal } from "@/components/landing/reveal";
import {
  IconSprout,
  IconFlame,
  IconAward,
  IconShieldCheck,
} from "@/components/icons";

export async function JourneySection() {
  const t = await getTranslations("Landing");

  const steps = [
    {
      Icon: IconSprout,
      title: t("journeySowTitle"),
      desc: t("journeySowDesc"),
    },
    {
      Icon: IconFlame,
      title: t("journeyGrowTitle"),
      desc: t("journeyGrowDesc"),
    },
    {
      Icon: IconAward,
      title: t("journeyReapTitle"),
      desc: t("journeyReapDesc"),
    },
    {
      Icon: IconShieldCheck,
      title: t("journeyKeepTitle"),
      desc: t("journeyKeepDesc"),
    },
  ];

  return (
    <section id="journey" className="section-pad">
      <SectionHeading
        eyebrow={t("journeyEyebrow")}
        title={t("journeyTitle")}
        subtitle={t("journeySubtitle")}
        className="mb-6"
        compact
      />
      <Reveal as="div">
        <ol className="journey-steps">
          {steps.map((s, i) => (
            <li key={s.title} className="journey-step">
              <span className="journey-step-marker" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="journey-step-icon" aria-hidden>
                    <s.Icon />
                  </span>
                  <h3 className="journey-step-title">{s.title}</h3>
                </div>
                <p className="journey-step-desc">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}
