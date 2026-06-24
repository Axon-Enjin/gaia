import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getTeacherCourseDetail } from "@/lib/courses/teacher";
import { getTeacherCourseAnalytics } from "@/lib/courses/teacher-analytics";
import { CourseEditorForm } from "@/components/teacher/course-editor-form";
import { TeacherCourseAnalyticsPanel } from "@/components/teacher/teacher-course-analytics";
import { IconArrowRight } from "@/components/icons";

export default async function TeacherCourseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return null;

  const t = await getTranslations("Teacher");
  const supabase = await createClient();
  const course = await getTeacherCourseDetail(supabase, id, user.id);

  if (!course) {
    notFound();
  }

  if (course.status !== "draft") {
    redirect(`/teacher/courses/${id}`);
  }

  const analytics = await getTeacherCourseAnalytics(supabase, id, user.id);

  return (
    <div>
      <Link
        href={`/teacher/courses/${id}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-primary-brand hover:underline"
      >
        <IconArrowRight className="rotate-180" aria-hidden="true" />
        {t("backToPreview")}
      </Link>

      <div className="mt-4 mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-warning-brand">
          {t("editorEyebrow")}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-soil-brand">{t("editorPageTitle")}</h1>
        <p className="mt-2 text-sm text-text-muted-brand">{t("editorPageSubtitle")}</p>
      </div>

      {analytics && (
        <div className="mb-8">
          <TeacherCourseAnalyticsPanel
            analytics={analytics}
            labels={{
              title: t("analyticsTitle"),
              enrollments: t("analyticsEnrollments"),
              completed: t("analyticsCompleted"),
              avgScore: t("analyticsAvgScore"),
              credentials: t("analyticsCredentials"),
              noScore: t("analyticsNoScore"),
            }}
          />
        </div>
      )}

      <CourseEditorForm course={course} />
    </div>
  );
}
