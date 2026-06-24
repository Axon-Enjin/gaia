import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { signOutAction } from "@/app/actions/auth";
import { getSessionUser } from "@/lib/auth";
import { getMeritSummary } from "@/lib/merit/ledger";
import { levelFromXp, nextLevelMinXp } from "@/lib/merit/constants";

export default async function LearnerProfilePage() {
  const t = await getTranslations("Learner");
  const tc = await getTranslations("Common");
  const user = await getSessionUser();
  if (!user) return null;

  let merit;
  try {
    merit = await getMeritSummary(user.id);
  } catch {
    merit = { totalXp: 0, streakDays: 0, badgeTypes: [] };
  }

  const level = levelFromXp(merit.totalXp);
  const nextXp = nextLevelMinXp(merit.totalXp);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-soil-brand sm:text-3xl">
          {t("profileTitle")}
        </h1>
        <p className="mt-1 text-sm text-text-muted-brand">
          {t("profileAccount")}
        </p>
      </div>

      <section className="course-hero mb-6">
        <p className="text-sm text-text-muted-brand">{t("profileEmail")}</p>
        <p className="mt-1 font-medium text-text-brand">{user.email}</p>
      </section>

      <section className="course-hero mb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-text-muted-brand">{t("totalXp")}</p>
            <p className="text-2xl font-bold text-growth-brand">
              {merit.totalXp.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-muted-brand">{t("level")}</p>
            <p className="text-lg font-semibold capitalize text-soil-brand">
              {t(`levels.${level}`)}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-muted-brand">{t("streak")}</p>
            <p className="text-lg font-semibold text-soil-brand">
              {t("streakDays", { count: merit.streakDays })}
            </p>
          </div>
        </div>
        {nextXp !== null && (
          <p className="mt-4 text-sm text-text-muted-brand">
            {t("nextLevel", { xp: nextXp - merit.totalXp })}
          </p>
        )}
        {merit.badgeTypes.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {merit.badgeTypes.map((b) => (
              <li
                key={b}
                className="rounded-full bg-growth-brand/10 px-3 py-1 text-xs font-medium text-growth-brand"
              >
                {t(`badges.${b}` as "badges.first_lesson")}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-6 rounded-xl border border-border-brand bg-surface-brand p-4">
        <p className="mb-3 text-sm font-medium text-text-brand">
          {tc("filipino")} / {tc("english")}
        </p>
        <LocaleSwitcher />
      </section>

      <section className="mb-6 rounded-xl border border-dashed border-border-brand bg-bg-brand/50 px-4 py-3 text-sm text-text-muted-brand">
        {t("walletComingSoon")}
      </section>

      <form action={signOutAction}>
        <button
          type="submit"
          className="min-h-11 rounded-lg border border-border-brand bg-surface-brand px-6 text-sm font-medium text-text-brand hover:bg-bg-brand"
        >
          {t("signOut")}
        </button>
      </form>
    </>
  );
}
