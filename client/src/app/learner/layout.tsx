import { redirect } from "next/navigation";
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
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const profile = await ensureProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "learner") redirect("/teacher");

  const t = await getTranslations("Learner");

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
        profile: t("navProfile"),
      }}
    >
      {children}
    </LearnerShell>
  );
}
