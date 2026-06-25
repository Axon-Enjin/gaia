import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { CourseCard } from "@/components/product/course-card";
import { getPublishedCourses } from "@/lib/courses/catalog";
import { EmptyState } from "@/components/states/empty-state";
import { IconBook } from "@/components/icons";

export default async function LearnerCoursesPage() {
  const t = await getTranslations("Catalog");
  const courses = await getPublishedCourses();

  return (
    <>
      <div className="mb-8 flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-growth-strong-brand">
          {t("eyebrow")}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-soil-brand sm:text-3xl">
          {t("title")}
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-text-muted-brand sm:text-base">
          {t("subtitle")}
        </p>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon={<IconBook />}
          text={t("empty")}
          action={
            <Link href="/learner" prefetch={false} className="btn btn-secondary btn-sm">
              {t("backHome")}
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              industry={course.industry}
              lessonCount={course.lessonCount}
              lessonsLabel={t("lessonsCount", { count: course.lessonCount })}
              viewLabel={t("viewCourse")}
              basePath="/learner/courses"
            />
          ))}
        </ul>
      )}
    </>
  );
}
