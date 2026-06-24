import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getTeacherCourseDetail } from "@/lib/courses/teacher";
import { getTeacherCourseAnalytics } from "@/lib/courses/teacher-analytics";
import { CourseDetailView } from "@/components/learner/course-detail-view";
import { TeacherCourseAnalyticsPanel } from "@/components/teacher/teacher-course-analytics";
import { DeleteCourseButton } from "@/components/teacher/delete-course-button";

export default async function TeacherCoursePreviewPage({
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

  const analytics = await getTeacherCourseAnalytics(supabase, id, user.id);
  const { status, ...detail } = course;

  return (
    <>
      {status === "draft" && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-surface)] border border-warning-brand/35 bg-warning-brand/10 px-4 py-3">
          <p className="text-sm text-warning-brand">{t("editorDraftCta")}</p>
          <Link
            href={`/teacher/courses/${id}/edit`}
            className="btn btn-primary btn-sm"
          >
            {t("editCourse")}
          </Link>
        </div>
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

      <CourseDetailView
        course={detail}
        backHref="/teacher/courses"
        mode="teacher"
        enrollment={null}
        signedIn
        teacherStatus={status}
      />

      <div className="mt-10 flex flex-col gap-2 border-t border-border-brand pt-6">
        <p className="text-sm text-text-muted-brand">{t("deleteSectionHint")}</p>
        <DeleteCourseButton
          courseId={course.id}
          courseTitle={course.title}
          variant="destructive"
        />
      </div>
    </>
  );
}
