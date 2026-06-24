import { getTranslations } from "next-intl/server";
import { IconShieldCheck, IconAward, IconGlobe } from "@/components/icons";

export async function TrustBandSection() {
  const t = await getTranslations("Landing");

  const chips = [
    {
      Icon: IconShieldCheck,
      label: t("trustVcLabel"),
      sub: t("trustVcSub"),
    },
    {
      Icon: IconAward,
      label: t("trustObLabel"),
      sub: t("trustObSub"),
    },
    {
      Icon: IconGlobe,
      label: t("trustChainLabel"),
      sub: t("trustChainSub"),
    },
  ];

  return (
    <section
      id="trust"
      className="section-pad border-t border-border-brand pt-8"
    >
      <p className="eyebrow mb-4">{t("trustEyebrow")}</p>
      <div className="trust-band">
        {chips.map((chip) => (
          <div key={chip.label} className="trust-chip">
            <span className="trust-chip-icon text-lg" aria-hidden>
              <chip.Icon />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="trust-chip-label">{chip.label}</span>
              <span className="trust-chip-sub">{chip.sub}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
