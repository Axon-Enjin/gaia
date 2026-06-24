import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { CourseCard } from "@/components/product/course-card";
import { getPublishedCourses } from "@/lib/courses/catalog";

export default async function LearnerCoursesPage() {
  const t = await getTranslations("Catalog");
  const courses = await getPublishedCourses();

  return (
    <>
      <div className="mb-8 flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-growth-brand">
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
        <div className="callout-card text-center">
          <p className="text-text-muted-brand">{t("empty")}</p>
          <Link
            href="/learner"
            className="mt-3 inline-block text-sm font-medium text-primary-brand hover:underline"
          >
            ← {t("backHome")}
          </Link>
        </div>
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
