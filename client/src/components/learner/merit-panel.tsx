import { getLocale, getTranslations } from "next-intl/server";
import { formatLocaleNumber } from "@/lib/i18n/format";
import {
  levelFromXp,
  nextLevelMinXp,
  levelFloorXp,
} from "@/lib/merit/constants";
import { IconSprout, IconFlame, IconAward } from "@/components/icons";

interface MeritPanelProps {
  totalXp: number;
  streakDays: number;
  badgeTypes: string[];
  /** compact omits the progress bar (used in tight spaces) */
  compact?: boolean;
}

/**
 * Shared merit summary — level badge, XP, streak, progress to next level, and
 * earned badges. Product Mode: system fonts, single subtle progress fill, no
 * confetti (DSD §5). Used on the learner home and profile.
 */
export async function MeritPanel({
  totalXp,
  streakDays,
  badgeTypes,
  compact = false,
}: MeritPanelProps) {
  const t = await getTranslations("Learner");
  const locale = await getLocale();

  const level = levelFromXp(totalXp);
  const nextXp = nextLevelMinXp(totalXp);
  const floor = levelFloorXp(totalXp);
  const pct =
    nextXp !== null && nextXp > floor
      ? Math.min(
          100,
          Math.max(0, Math.round(((totalXp - floor) / (nextXp - floor)) * 100)),
        )
      : 100;

  return (
    <section className="course-hero">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-growth-brand/12 px-3 py-1.5 text-sm font-semibold text-growth-strong-brand">
          <IconSprout aria-hidden="true" />
          <span className="capitalize">{t(`levels.${level}`)}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-brand/12 px-3 py-1.5 text-sm font-semibold text-warning-brand">
          <IconFlame aria-hidden="true" />
          {t("streakDays", { count: streakDays })}
        </span>
      </div>

      <div className="mt-5 flex items-end gap-2">
        <span className="text-4xl font-bold leading-none text-growth-strong-brand tabular-nums">
          {formatLocaleNumber(locale, totalXp)}
        </span>
        <span className="pb-1 text-sm font-medium uppercase tracking-wide text-text-muted-brand">
          {t("totalXp")}
        </span>
      </div>

      {!compact && (
        <div className="mt-4">
          <div
            className="progress-track"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          {nextXp !== null && (
            <p className="mt-2 text-sm text-text-muted-brand">
              {t("nextLevel", { xp: nextXp - totalXp })}
            </p>
          )}
        </div>
      )}

      {badgeTypes.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {badgeTypes.map((b) => (
            <li
              key={b}
              className="inline-flex items-center gap-1.5 rounded-full bg-soil-brand/8 px-3 py-1 text-xs font-semibold text-soil-brand"
            >
              <IconAward aria-hidden="true" />
              {t(`badges.${b}` as "badges.first_lesson")}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
