import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { UploadGenerateForm } from "@/components/upload-generate-form";

/**
 * Teacher dashboard. The auth boundary lives HERE (layout/page + Server
 * Actions), not in proxy.ts. A non-teacher is redirected away.
 */
export default async function TeacherDashboardPage() {
  const t = await getTranslations("Teacher");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "teacher") {
    redirect("/");
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("dashboardTitle")}
        </h1>
        <LocaleSwitcher />
      </header>

      <section className="flex flex-col gap-4 rounded border border-gray-200 p-6">
        <div>
          <h2 className="text-lg font-semibold">{t("uploadTitle")}</h2>
          <p className="mt-1 text-sm text-gray-600">{t("uploadHint")}</p>
        </div>
        <UploadGenerateForm />
      </section>
    </main>
  );
}
