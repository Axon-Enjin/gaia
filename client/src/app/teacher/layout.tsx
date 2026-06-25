import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { TeacherShell } from "@/components/teacher/shell/teacher-shell";
import { getSessionUser, ensureProfile } from "@/lib/auth";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const profile = await ensureProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "teacher") redirect("/learner");

  const t = await getTranslations("Teacher");
  const tc = await getTranslations("Common");

  return (
    <TeacherShell
      displayName={profile.display_name}
      email={user.email ?? ""}
      roleLabel={t("accountRole")}
      navLabels={{
        home: t("navHome"),
        courses: t("navCourses"),
        profile: t("navProfile"),
      }}
      ariaLabels={{
        shellNav: tc("teacherNavigation"),
        mainNav: tc("mainNavigation"),
        brandHome: tc("brandHome"),
      }}
    >
      {children}
    </TeacherShell>
  );
}
