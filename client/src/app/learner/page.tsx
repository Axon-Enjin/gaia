import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { getMeritSummary } from "@/lib/merit/ledger";
import { levelFromXp, nextLevelMinXp } from "@/lib/merit/constants";
import { parseProgress } from "@/lib/enrollments/progress";

function courseFromJoin(raw: unknown): {
  title: string;
  industry: string;
  lessonCount: number;
} | null {
  if (!raw || typeof raw !== "object") return null;
  const row = Array.isArray(raw) ? raw[0] : raw;
  if (!row || typeof row !== "object") return null;
  const lessons = (row as { lessons?: { count: number }[] }).lessons;
  return {
    title: (row as { title: string }).title,
    industry: (row as { industry: string }).industry,
    lessonCount: lessons?.[0]?.count ?? 0,
  };
}

export default async function LearnerHomePage() {
  const t = await getTranslations("Learner");
  const user = await getSessionUser();
  if (!user) return null;

  let merit;
  try {
    merit = await getMeritSummary(user.id);
  } catch {
    merit = { totalXp: 0, streakDays: 0, badgeTypes: [] };
  }

  const level = levelFromXp(merit.totalXp);
  const nextXp = nextLevelMinXp(merit.totalXp);

  const supabase = await createClient();
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(
      "id, course_id, progress, completed_at, final_score, courses(title, industry, lessons(count))",
    )
    .eq("learner_id", user.id)
    .order("id", { ascending: false });

  return (
    <>
      <div className="mb-8 flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-soil-brand sm:text-3xl">
          {t("dashboardTitle")}
        </h1>
        <p className="text-sm text-text-muted-brand">{t("homeSubtitle")}</p>
      </div>

      <section className="course-hero mb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-text-muted-brand">{t("totalXp")}</p>
            <p className="text-3xl font-bold text-growth-brand">
              {merit.totalXp.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-muted-brand">{t("level")}</p>
            <p className="text-lg font-semibold capitalize text-soil-brand">
              {t(`levels.${level}`)}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-muted-brand">{t("streak")}</p>
            <p className="text-lg font-semibold text-soil-brand">
              {t("streakDays", { count: merit.streakDays })}
            </p>
          </div>
        </div>
        {nextXp !== null && (
          <p className="mt-4 text-sm text-text-muted-brand">
            {t("nextLevel", { xp: nextXp - merit.totalXp })}
          </p>
        )}
        {merit.badgeTypes.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {merit.badgeTypes.map((b) => (
              <li
                key={b}
                className="rounded-full bg-growth-brand/10 px-3 py-1 text-xs font-medium text-growth-brand"
              >
                {t(`badges.${b}` as "badges.first_lesson")}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-soil-brand">
            {t("continueLearning")}
          </h2>
          <Link
            href="/learner/courses"
            className="text-sm font-medium text-primary-brand hover:underline"
          >
            {t("browseCourses")} →
          </Link>
        </div>

        {!enrollments?.length ? (
          <div className="callout-card text-center">
            <p className="text-text-muted-brand">{t("noEnrollments")}</p>
            <Link
              href="/learner/courses"
              className="mt-3 inline-block text-sm font-medium text-primary-brand hover:underline"
            >
              {t("browseCourses")}
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {enrollments.map((row) => {
              const course = courseFromJoin(row.courses);
              const progress = parseProgress(row.progress);
              const doneCount = Object.values(progress).filter(
                (p) => p.quiz_passed,
              ).length;
              const total = course?.lessonCount ?? 0;
              const pct =
                total > 0 ? Math.round((doneCount / total) * 100) : 0;

              return (
                <li
                  key={row.id as string}
                  className="rounded-xl border border-border-brand bg-surface-brand p-4 transition hover:border-soil-brand/30 hover:shadow-sm"
                >
                  <Link
                    href={`/learner/courses/${row.course_id as string}`}
                    className="block"
                  >
                    <div className="flex items-start gap-3">
                      <div className="course-thumb text-sm" aria-hidden>
                        {(course?.industry ?? "C").trim().charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-text-brand">
                          {course?.title ?? t("untitledCourse")}
                        </span>
                        <span className="ml-2 text-sm text-text-muted-brand">
                          {course?.industry}
                        </span>
                        <p className="mt-1 text-sm text-text-muted-brand">
                          {row.completed_at
                            ? t("courseFinished", {
                                score: row.final_score ?? 0,
                              })
                            : t("lessonsDone", { count: doneCount })}
                        </p>
                        {!row.completed_at && total > 0 && (
                          <div className="progress-track mt-3">
                            <div
                              className="progress-fill"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
