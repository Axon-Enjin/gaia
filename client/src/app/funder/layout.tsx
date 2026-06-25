import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { FunderShell } from "@/components/funder/shell/funder-shell";
import { getSessionUser, ensureProfile } from "@/lib/auth";

export default async function FunderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const profile = await ensureProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "funder") {
    if (profile.role === "teacher") redirect("/teacher");
    redirect("/learner");
  }

  const t = await getTranslations("Funder");

  return (
    <FunderShell
      displayName={profile.display_name}
      email={user.email ?? ""}
      roleLabel={t("accountRole")}
      navLabels={{
        programs: t("navPrograms"),
        profile: t("navProfile"),
      }}
    >
      {children}
    </FunderShell>
  );
}
