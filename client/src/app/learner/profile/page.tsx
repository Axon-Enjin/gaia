import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { signOutAction } from "@/app/actions/auth";
import { getSessionUser } from "@/lib/auth";
import { getMeritSummary } from "@/lib/merit/ledger";
import { MeritPanel } from "@/components/learner/merit-panel";
import { IconGlobe, IconAward } from "@/components/icons";

export default async function LearnerProfilePage() {
  const t = await getTranslations("Learner");
  const tc = await getTranslations("Common");
  const tcr = await getTranslations("Credentials");
  const user = await getSessionUser();
  if (!user) return null;

  let merit;
  try {
    merit = await getMeritSummary(user.id);
  } catch {
    merit = { totalXp: 0, streakDays: 0, badgeTypes: [] };
  }

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

      <div className="mb-6">
        <MeritPanel
          totalXp={merit.totalXp}
          streakDays={merit.streakDays}
          badgeTypes={merit.badgeTypes}
        />
      </div>

      <section className="mb-6 rounded-[var(--radius-surface)] border border-border-brand bg-surface-brand p-4">
        <p className="text-sm text-text-muted-brand">{t("profileEmail")}</p>
        <p className="mt-1 font-medium text-text-brand">{user.email}</p>
      </section>

      <section className="mb-6 rounded-[var(--radius-surface)] border border-border-brand bg-surface-brand p-4">
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-text-brand">
          <IconGlobe className="text-text-muted-brand" aria-hidden="true" />
          {tc("filipino")} / {tc("english")}
        </p>
        <LocaleSwitcher />
      </section>

      <section className="mb-6 rounded-[var(--radius-surface)] border border-border-brand bg-surface-brand p-4">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-text-brand">
          <IconAward className="text-growth-strong-brand" aria-hidden="true" />
          {tcr("walletTitle")}
        </p>
        <p className="mt-1 text-sm text-text-muted-brand">
          {tcr("walletSubtitle")}
        </p>
        <Link
          href="/learner/credentials"
          prefetch={false}
          className="btn btn-primary btn-sm mt-4"
        >
          {t("navCredentials")}
        </Link>
      </section>

      <form action={signOutAction}>
        <button type="submit" className="btn btn-ghost border border-border-brand">
          {t("signOut")}
        </button>
      </form>
    </>
  );
}
