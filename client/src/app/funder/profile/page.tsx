import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { signOutAction } from "@/app/actions/auth";
import { getSessionUser } from "@/lib/auth";
import { IconGlobe, IconUser } from "@/components/icons";

export default async function FunderProfilePage() {
  const t = await getTranslations("Funder");
  const tc = await getTranslations("Common");
  const user = await getSessionUser();
  if (!user) return null;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-soil-brand sm:text-3xl">
          {t("profileTitle")}
        </h1>
        <p className="mt-1 text-sm text-text-muted-brand">{t("profileAccount")}</p>
      </div>

      <section className="course-hero mb-6">
        <p className="text-sm text-text-muted-brand">{t("profileEmail")}</p>
        <p className="mt-1 font-medium text-text-brand">{user.email}</p>
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-growth-brand/12 px-3 py-1 text-xs font-semibold text-growth-strong-brand">
          <IconUser aria-hidden="true" />
          {t("accountRole")}
        </p>
      </section>

      <section className="mb-6 rounded-[var(--radius-surface)] border border-border-brand bg-surface-brand p-4">
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-text-brand">
          <IconGlobe className="text-text-muted-brand" aria-hidden="true" />
          {tc("filipino")} / {tc("english")}
        </p>
        <LocaleSwitcher />
      </section>

      <form action={signOutAction}>
        <button type="submit" className="btn btn-ghost border border-border-brand">
          {tc("signOut")}
        </button>
      </form>
    </>
  );
}
