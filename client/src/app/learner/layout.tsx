import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { LearnerShell } from "@/components/learner/shell/learner-shell";
import { getSessionUser, ensureProfile } from "@/lib/auth";
import { getMeritSummary } from "@/lib/merit/ledger";
import { levelFromXp } from "@/lib/merit/constants";

export default async function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const profile = await ensureProfile();
  if (!profile) redirect("/login");
  if (profile.role === "teacher") redirect("/teacher");
  if (profile.role === "funder") redirect("/funder");

  const t = await getTranslations("Learner");
  const tc = await getTranslations("Common");

  let levelId = levelFromXp(0);
  try {
    const merit = await getMeritSummary(user.id);
    levelId = levelFromXp(merit.totalXp);
  } catch {
    /* merit optional for shell chrome */
  }

  return (
    <LearnerShell
      displayName={profile.display_name}
      email={user.email ?? ""}
      levelLabel={t(`levels.${levelId}`)}
      navLabels={{
        home: t("navHome"),
        courses: t("navCourses"),
        credentials: t("navCredentials"),
        profile: t("navProfile"),
      }}
      ariaLabels={{
        shellNav: tc("learnerNavigation"),
        mainNav: tc("mainNavigation"),
        brandHome: tc("brandHome"),
      }}
    >
      {children}
    </LearnerShell>
  );
}
