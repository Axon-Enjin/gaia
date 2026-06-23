import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getPublishedCourseDetail } from "@/lib/courses/detail";
import { renderMarkdown } from "@/lib/markdown";
import { LocaleSwitcher } from "@/components/locale-switcher";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations("CourseDetail");
  const { id } = await params;
  const course = await getPublishedCourseDetail(id);

  if (!course) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="flex items-center justify-between gap-4">
        <Link href="/courses" className="text-sm text-gray-600 hover:underline">
          ← {t("backToCatalog")}
        </Link>
        <LocaleSwitcher />
      </header>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
        <p className="mt-1 text-sm text-gray-500">{course.industry}</p>
      </div>

      <ol className="flex flex-col gap-8">
        {course.lessons.map((lesson, index) => (
          <li key={lesson.id} className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-xl font-semibold">
                {index + 1}. {lesson.title}
              </h2>
              <span className="shrink-0 text-xs uppercase tracking-wide text-gray-500">
                {lesson.difficulty}
              </span>
            </div>

            {/* Sanitized server-rendered Markdown — never executed (LLM02). */}
            <div
              className="prose prose-sm max-w-none text-gray-800"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(lesson.body_md) }}
            />

            {lesson.questions.length > 0 ? (
              <div className="rounded border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-700">
                  {t("quiz")}
                </h3>
                <ol className="mt-2 flex flex-col gap-3">
                  {lesson.questions.map((q) => (
                    <li key={q.id}>
                      <p className="text-sm font-medium">{q.prompt}</p>
                      <ul className="mt-1 flex flex-col gap-1">
                        {q.choices.map((choice, ci) => (
                          <li
                            key={ci}
                            className="text-sm text-gray-700"
                          >
                            {String.fromCharCode(65 + ci)}. {choice}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </main>
  );
}
