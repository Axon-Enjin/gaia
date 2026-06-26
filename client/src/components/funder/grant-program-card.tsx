import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import type { GrantProgramRow } from "@/lib/grants/programs";
import { formatLocaleNumber } from "@/lib/i18n/format";
import { IconArrowRight } from "@/components/icons";

export interface GrantProgramCardProps {
  program: GrantProgramRow;
}

export async function GrantProgramCard({ program }: GrantProgramCardProps) {
  const t = await getTranslations("Funder");
  const locale = await getLocale();
  const { criteria } = program;

  return (
    <Link
      href={`/funder/programs/${program.id}`}
      className="course-card group block p-6 md:p-8 rounded-2xl"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-soil-brand md:text-2xl group-hover:text-growth-strong-brand transition-colors">
            {program.name}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="industry-pill text-xs px-2.5 py-1">{criteria.industry}</span>
            <span className="rounded-full bg-soil-brand/6 px-3 py-1 text-xs font-semibold text-text-muted-brand">
              {t("minXpChip", { xp: criteria.min_xp })}
            </span>
            {(criteria.required_badges ?? []).map((badge) => (
              <span
                key={badge}
                className="rounded-full bg-bg-brand px-3 py-1 text-xs font-semibold text-text-muted-brand"
              >
                {t(`badges.${badge}`)}
              </span>
            ))}
            {criteria.require_credential && (
              <span className="rounded-full bg-growth-brand/10 px-3 py-1 text-xs font-bold text-growth-strong-brand">
                {t("credentialRequired")}
              </span>
            )}
          </div>
          {program.amount_per_learner !== null && (
            <p className="mt-3 font-mono text-base font-bold tabular-nums text-text-brand">
              {t("amountPerLearner", {
                amount: formatLocaleNumber(locale, program.amount_per_learner),
              })}
            </p>
          )}
        </div>
        <span className="inline-flex items-center gap-1.5 text-base font-bold text-primary-brand">
          {t("openProgram")} <IconArrowRight aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
