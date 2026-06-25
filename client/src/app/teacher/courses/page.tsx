import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { getTeacherCourses } from "@/lib/courses/teacher";
import { TeacherCourseCard } from "@/components/teacher/teacher-course-card";
import { EmptyState } from "@/components/states/empty-state";
import { IconLayers } from "@/components/icons";

export default async function TeacherCoursesPage() {
  const t = await getTranslations("Teacher");
  const user = await getSessionUser();
  if (!user) return null;

  const supabase = await createClient();
  const courses = await getTeacherCourses(supabase, user.id);

  return (
    <>
      <div className="mb-8 flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-growth-strong-brand">
          {t("coursesEyebrow")}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-soil-brand sm:text-3xl">
          {t("coursesTitle")}
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-text-muted-brand sm:text-base">
          {t("coursesSubtitle")}
        </p>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon={<IconLayers />}
          text={t("noCoursesEmpty")}
          action={
            <Link href="/teacher" prefetch={false} className="btn btn-secondary btn-sm">
              {t("navHome")}
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {courses.map((course) => (
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
    </>
  );
}
