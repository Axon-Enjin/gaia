import Link from "next/link";
import { notFound } from "next/navigation";
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
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    raw_chars?: string;
    prepared_chars?: string;
    reduction_pct?: string;
  }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await getSessionUser();
  if (!user) return null;

  const t = await getTranslations("Teacher");
  const supabase = await createClient();
  const course = await getTeacherCourseDetail(supabase, id, user.id);

  if (!course) {
    notFound();
  }

  if (course.status !== "draft") {
    return (
      <div className="rounded-[var(--radius-surface)] border border-growth-brand/35 bg-growth-brand/10 px-4 py-6">
        <p className="font-semibold text-growth-strong-brand">{t("published")}</p>
        <p className="mt-2 text-sm text-text-muted-brand">{t("editorPageSubtitle")}</p>
        <Link
          href={`/teacher/courses/${id}`}
          className="btn btn-primary btn-sm mt-4 inline-flex"
        >
          {t("previewCourse")}
        </Link>
      </div>
    );
  }

  const analytics = await getTeacherCourseAnalytics(supabase, id, user.id);

  const rawChars = Number(sp.raw_chars);
  const preparedChars = Number(sp.prepared_chars);
  const reductionPct = Number(sp.reduction_pct);
  const showPreprocess =
    Number.isFinite(rawChars) &&
    Number.isFinite(preparedChars) &&
    rawChars > 0 &&
    preparedChars > 0;

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

      {showPreprocess && (
        <p
          className="mb-6 rounded-[var(--radius-surface)] border border-border-brand bg-bg-brand/60 px-4 py-3 text-sm text-text-muted-brand"
          role="status"
        >
          {t("preprocessStat", {
            raw: rawChars.toLocaleString(),
            prepared: preparedChars.toLocaleString(),
            pct: Number.isFinite(reductionPct) ? reductionPct : 0,
          })}
        </p>
      )}

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
