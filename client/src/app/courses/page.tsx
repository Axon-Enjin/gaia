import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { getPublishedCourses } from "@/lib/courses/catalog";

export default async function CoursesPage() {
  const t = await getTranslations("Catalog");
  // Cached read path (no AI, no per-user data) — see lib/courses/catalog.ts.
  const courses = await getPublishedCourses();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <LocaleSwitcher />
      </header>

      {courses.length === 0 ? (
        <p className="text-gray-600">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {courses.map((course) => (
            <li
              key={course.id}
              className="rounded border border-gray-200 p-4 hover:border-gray-400"
            >
              <Link href={`/courses/${course.id}`} className="block">
                <span className="font-medium">{course.title}</span>
                <span className="ml-2 text-sm text-gray-500">
                  {course.industry}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
