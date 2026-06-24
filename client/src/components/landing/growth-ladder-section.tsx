import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/landing/section-heading";
import { Reveal } from "@/components/landing/reveal";

export async function GrowthLadderSection() {
  const t = await getTranslations("Landing");
  const tl = await getTranslations("Learner");

  const rungs = [
    { name: tl("levels.seed"), meta: t("ladderSeedMeta") },
    { name: tl("levels.sprout"), meta: t("ladderSproutMeta") },
    { name: tl("levels.scholar"), meta: t("ladderScholarMeta") },
    { name: tl("levels.expert"), meta: t("ladderExpertMeta") },
    { name: tl("levels.mentor"), meta: t("ladderMentorMeta") },
  ];

  return (
    <section className="section-pad">
      <SectionHeading
        eyebrow={t("ladderEyebrow")}
        title={t("ladderTitle")}
        subtitle={t("ladderSubtitle")}
      />
      <ol className="growth-ladder">
        {rungs.map((rung, i) => (
          <Reveal
            as="li"
            key={rung.name}
            delay={i * 70}
            className="growth-rung"
          >
            <span
              className="growth-rung-dot"
              style={{ "--rung": i } as React.CSSProperties}
              aria-hidden
            >
              {/* sprout sized by rung */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M12 20v-7" />
                <path d="M12 13c0-3 2-5 5-5.2C17 11 15 13 12 13z" />
                <path d="M12 14c0-2.4-1.8-4-4.4-4.2C7.6 12 9.4 14 12 14z" />
              </svg>
            </span>
            <span className="growth-rung-name">{rung.name}</span>
            <span className="growth-rung-meta">{rung.meta}</span>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
