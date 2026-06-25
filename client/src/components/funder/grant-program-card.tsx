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
      className="course-card group block"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-soil-brand group-hover:text-growth-strong-brand">
            {program.name}
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="industry-pill">{criteria.industry}</span>
            <span className="text-xs text-text-muted-brand">
              {t("minXpChip", { xp: criteria.min_xp })}
            </span>
            {(criteria.required_badges ?? []).map((badge) => (
              <span
                key={badge}
                className="rounded-full bg-bg-brand px-2 py-0.5 text-xs font-medium text-text-muted-brand"
              >
                {t(`badges.${badge}`)}
              </span>
            ))}
            {criteria.require_credential && (
              <span className="text-xs font-medium text-growth-strong-brand">
                {t("credentialRequired")}
              </span>
            )}
          </div>
          {program.amount_per_learner !== null && (
            <p className="mt-2 font-mono text-sm tabular-nums text-text-brand">
              {t("amountPerLearner", {
                amount: formatLocaleNumber(locale, program.amount_per_learner),
              })}
            </p>
          )}
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-brand">
          {t("openProgram")} <IconArrowRight aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
