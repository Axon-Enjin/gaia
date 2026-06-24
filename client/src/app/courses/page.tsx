import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ProductHeader } from "@/components/product/product-header";
import { CourseCard } from "@/components/product/course-card";
import { getPublishedCourses } from "@/lib/courses/catalog";
import {
  getSessionDashboardHref,
  navCtaHref,
} from "@/lib/auth/dashboard-href";

export default async function CoursesPage() {
  const t = await getTranslations("Catalog");
  const tLanding = await getTranslations("Landing");
  const courses = await getPublishedCourses();

  const { user, dashboardHref } = await getSessionDashboardHref();
  const cta = {
    href: navCtaHref(!!user, dashboardHref),
    label:
      user && dashboardHref
        ? tLanding("goToApp")
        : tLanding("navGetStarted"),
  };

  return (
    <div className="product-page flex min-h-full flex-col">
      <ProductHeader cta={cta} />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-8 sm:py-10">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-growth-brand">
            {t("eyebrow")}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-soil-brand sm:text-4xl">
            {t("title")}
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-text-muted-brand">
            {t("subtitle")}
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="callout-card text-center">
            <p className="text-text-muted-brand">{t("empty")}</p>
            <Link
              href="/"
              className="mt-3 inline-block text-sm font-medium text-primary-brand hover:underline"
            >
              {t("backHome")}
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
              />
            ))}
          </ul>
        )}

        {!user && (
          <p className="text-center text-sm text-text-muted-brand">
            {t("signInHint")}{" "}
            <Link
              href="/login?mode=sign-up"
              className="font-medium text-primary-brand hover:underline"
            >
              {t("signInCta")}
            </Link>
          </p>
        )}
      </main>
    </div>
  );
}
