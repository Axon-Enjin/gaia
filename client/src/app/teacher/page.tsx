import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import {
  getTeacherCourses,
  getTeacherCourseStats,
} from "@/lib/courses/teacher";
import { UploadGenerateForm } from "@/components/upload-generate-form";
import { TeacherCourseCard } from "@/components/teacher/teacher-course-card";
import { EmptyState } from "@/components/states/empty-state";
import { IconLayers, IconArrowRight, IconSpark } from "@/components/icons";

export default async function TeacherHomePage() {
  const t = await getTranslations("Teacher");
  const user = await getSessionUser();
  if (!user) return null;

  const supabase = await createClient();
  const courses = await getTeacherCourses(supabase, user.id);
  const stats = getTeacherCourseStats(courses);
  const recent = courses.slice(0, 3);

  return (
    <>
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-soil-brand sm:text-4xl lg:text-5xl">
          {t("dashboardTitle")}
        </h1>
        <p className="text-base lg:text-lg text-text-muted-brand">{t("homeSubtitle")}</p>
      </div>

      <section className="mb-8 grid grid-cols-2 gap-6">
        <div className="rounded-[var(--radius-surface)] border border-border-brand bg-surface-brand p-6 md:p-8">
          <p className="text-base font-semibold text-text-muted-brand">{t("statPublished")}</p>
          <p className="mt-2 text-5xl font-extrabold tabular-nums text-growth-strong-brand md:text-6xl">
            {stats.publishedCount}
          </p>
        </div>
        <div className="rounded-[var(--radius-surface)] border border-border-brand bg-surface-brand p-6 md:p-8">
          <p className="text-base font-semibold text-text-muted-brand">{t("statDrafts")}</p>
          <p className="mt-2 text-5xl font-extrabold tabular-nums text-soil-brand md:text-6xl">
            {stats.draftCount}
          </p>
        </div>
      </section>

      <section className="callout-card p-6 md:p-8 mb-8">
        <div className="mb-6 flex items-start gap-4">
          <span
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-growth-brand/12 text-xl text-growth-strong-brand"
            aria-hidden
          >
            <IconSpark />
          </span>
          <div>
            <h2 className="text-xl font-bold text-soil-brand md:text-2xl">
              {t("uploadTitle")}
            </h2>
            <p className="mt-1 text-base text-text-muted-brand">
              {t("uploadHint")}
            </p>
          </div>
        </div>
        <UploadGenerateForm />
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-soil-brand lg:text-2xl">
            {t("recentCourses")}
          </h2>
          {courses.length > 0 && (
            <Link
              href="/teacher/courses"
              className="inline-flex items-center gap-1 text-base font-semibold text-primary-brand hover:underline"
            >
              {t("viewAllCourses")} <IconArrowRight aria-hidden="true" />
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <EmptyState icon={<IconLayers />} text={t("noCourses")} />
        ) : (
          <ul className="flex flex-col gap-3">
            {recent.map((course) => (
              <TeacherCourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                industry={course.industry}
                lessonCount={course.lessonCount}
                status={course.status}
                lessonsLabel={t("lessonsCount", { count: course.lessonCount })}
                previewLabel={t("previewCourse")}
                editLabel={t("editCourse")}
                statusPublishedLabel={t("statusPublished")}
                statusDraftLabel={t("statusDraft")}
                viewPublicLabel={t("viewPublic")}
              />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
