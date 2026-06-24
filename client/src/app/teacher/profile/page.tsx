import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { signOutAction } from "@/app/actions/auth";
import { getSessionUser } from "@/lib/auth";

export default async function TeacherProfilePage() {
  const t = await getTranslations("Teacher");
  const tc = await getTranslations("Common");
  const user = await getSessionUser();
  if (!user) return null;

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
        <p className="mt-3 text-sm text-growth-brand">{t("accountRole")}</p>
      </section>

      <section className="mb-6 rounded-xl border border-border-brand bg-surface-brand p-4">
        <p className="mb-3 text-sm font-medium text-text-brand">
          {tc("filipino")} / {tc("english")}
        </p>
        <LocaleSwitcher />
      </section>

      <form action={signOutAction}>
        <button
          type="submit"
          className="min-h-11 rounded-lg border border-border-brand bg-surface-brand px-6 text-sm font-medium text-text-brand hover:bg-bg-brand"
        >
          {tc("signOut")}
        </button>
      </form>
    </>
  );
}
