import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/auth";
import { getTeacherCourses } from "@/lib/courses/teacher";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { UploadGenerateForm } from "@/components/upload-generate-form";
import { PublishButton } from "@/components/publish-button";

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
    redirect("/login");
  }

  // Provision the profile on first visit, then gate by role.
  const profile = await ensureProfile();
  if (profile?.role !== "teacher") {
    redirect("/courses");
  }

  const courses = await getTeacherCourses(supabase, user.id);

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

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">{t("myCourses")}</h2>
        {courses.length === 0 ? (
          <p className="text-sm text-gray-600">{t("noCourses")}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {courses.map((course) => (
              <li
                key={course.id}
                className="flex items-center justify-between gap-4 rounded border border-gray-200 p-4"
              >
                <div className="min-w-0">
                  <Link
                    href={`/courses/${course.id}`}
                    className="font-medium hover:underline"
                  >
                    {course.title}
                  </Link>
                  <span className="ml-2 text-sm text-gray-500">
                    {course.industry}
                  </span>
                </div>
                {course.status === "published" ? (
                  <span className="shrink-0 text-sm text-green-700">
                    {t("statusPublished")}
                  </span>
                ) : (
                  <PublishButton courseId={course.id} />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
