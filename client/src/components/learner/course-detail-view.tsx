import Link from "next/link";

import { getTranslations } from "next-intl/server";

import type { CourseDetail } from "@/lib/courses/detail";

import { renderMarkdown } from "@/lib/markdown";

import {

  isLessonComplete,

  type EnrollmentProgress,

} from "@/lib/enrollments/progress";

import { EnrollButton } from "@/components/learner/enroll-button";

import { LessonQuiz } from "@/components/learner/lesson-quiz";

import { CompleteLessonButton } from "@/components/learner/complete-lesson-button";

import { PublishButton } from "@/components/publish-button";



function difficultyClass(

  difficulty: "beginner" | "intermediate" | "advanced",

): string {

  if (difficulty === "intermediate") return "difficulty-intermediate";

  if (difficulty === "advanced") return "difficulty-advanced";

  return "difficulty-beginner";

}



export interface CourseDetailViewProps {

  course: CourseDetail;

  backHref: string;

  mode: "public" | "learner" | "teacher";

  enrollment: {

    progress: EnrollmentProgress;

    completed_at: string | null;

  } | null;

  signedIn: boolean;

  /** Teacher preview only — draft vs published status banner + publish CTA. */

  teacherStatus?: "draft" | "published";

}



/** Shared course viewer body — public catalog, learner shell, or teacher preview. */

export async function CourseDetailView({

  course,

  backHref,

  mode,

  enrollment,

  signedIn,

  teacherStatus,

}: CourseDetailViewProps) {

  const t = await getTranslations("CourseDetail");

  const tl = await getTranslations("Learner");

  const tt = await getTranslations("Teacher");



  const isLearnerMode = mode === "learner";

  const isTeacherMode = mode === "teacher";

  const totalLessons = course.lessons.length;

  const completedLessons = enrollment

    ? course.lessons.filter((l) =>

        isLessonComplete(enrollment.progress, l.id),

      ).length

    : 0;

  const progressPct =

    totalLessons > 0

      ? Math.round((completedLessons / totalLessons) * 100)

      : 0;



  const backLabel = isTeacherMode ? tt("backToCourses") : t("backToCatalog");



  return (

    <div className="flex flex-col gap-8">

      <Link

        href={backHref}

        className="inline-flex w-fit items-center gap-1 text-sm font-medium text-text-muted-brand hover:text-soil-brand"

      >

        <span aria-hidden>←</span> {backLabel}

      </Link>



      {isTeacherMode && teacherStatus === "draft" && (

        <div className="rounded-xl border border-warning-brand/35 bg-warning-brand/10 px-4 py-3 text-sm text-warning-brand">

          <div className="flex flex-wrap items-center justify-between gap-3">

            <span>{tt("draftPreviewBanner")}</span>

            <PublishButton courseId={course.id} />

          </div>

        </div>

      )}



      {isTeacherMode && teacherStatus === "published" && (

        <div className="rounded-xl border border-growth-brand/35 bg-growth-brand/10 px-4 py-3 text-sm text-growth-brand">

          <div className="flex flex-wrap items-center justify-between gap-3">

            <span>{tt("publishedPreviewBanner")}</span>

            <Link

              href={`/courses/${course.id}`}

              className="font-medium text-primary-brand hover:underline"

            >

              {tt("viewPublic")} →

            </Link>

          </div>

        </div>

      )}



      <section className="course-hero">

        <div className="flex flex-wrap items-start gap-4">

          <div className="course-thumb text-xl" aria-hidden>

            {course.industry.trim().charAt(0) || "C"}

          </div>

          <div className="min-w-0 flex-1">

            <span className="industry-pill">{course.industry}</span>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-soil-brand sm:text-3xl">

              {course.title}

            </h1>

            <p className="mt-2 text-sm text-text-muted-brand">

              {t("metaLine", {

                count: totalLessons,

                passing: course.passing_score,

              })}

            </p>

          </div>

        </div>



        {enrollment && totalLessons > 0 && !enrollment.completed_at && (

          <div className="mt-6 border-t border-border-brand pt-5">

            <div className="mb-2 flex items-center justify-between text-sm">

              <span className="font-medium text-text-brand">

                {t("progressLabel")}

              </span>

              <span className="text-text-muted-brand">

                {t("progressCount", {

                  done: completedLessons,

                  total: totalLessons,

                })}

              </span>

            </div>

            <div

              className="progress-track"

              role="progressbar"

              aria-valuenow={progressPct}

              aria-valuemin={0}

              aria-valuemax={100}

              aria-label={t("progressLabel")}

            >

              <div

                className="progress-fill"

                style={{ width: `${progressPct}%` }}

              />

            </div>

          </div>

        )}

      </section>



      {isLearnerMode && !enrollment && (

        <div className="callout-card">

          <p className="mb-4 text-sm leading-relaxed text-text-muted-brand">

            {tl("enrollHint")}

          </p>

          <EnrollButton courseId={course.id} />

        </div>

      )}



      {!isLearnerMode && !isTeacherMode && !signedIn && (

        <div className="callout-card">

          <p className="text-sm text-text-brand">

            <Link

              href="/login"

              className="font-semibold text-primary-brand underline hover:no-underline"

            >

              {tl("signInToLearn")}

            </Link>

          </p>

        </div>

      )}



      {enrollment?.completed_at && (

        <div className="rounded-xl border border-growth-brand/35 bg-growth-brand/10 px-4 py-3 text-sm font-medium text-growth-brand">

          {tl("courseFinishedBanner")}

        </div>

      )}



      {isLearnerMode && enrollment && !enrollment.completed_at && (

        <div className="rounded-xl border border-border-brand bg-surface-brand px-4 py-3 text-sm text-text-brand">

          {t("enrolledBanner")}

        </div>

      )}



      {totalLessons === 0 ? (

        <p className="text-text-muted-brand">{t("noLessons")}</p>

      ) : (

        <ol className="flex flex-col gap-6">

          {course.lessons.map((lesson, index) => {

            const complete = enrollment

              ? isLessonComplete(enrollment.progress, lesson.id)

              : false;

            const canInteract = isLearnerMode && Boolean(enrollment);



            return (

              <li

                key={lesson.id}

                className={`lesson-panel ${complete ? "is-complete" : ""}`}

              >

                <div className="flex gap-4">

                  <div

                    className={`lesson-step ${complete ? "is-complete" : ""}`}

                    aria-hidden

                  >

                    {complete ? "✓" : index + 1}

                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">

                      <h2 className="text-lg font-semibold text-soil-brand">

                        {lesson.title}

                      </h2>

                      <span

                        className={`difficulty-pill ${difficultyClass(lesson.difficulty)}`}

                      >

                        {lesson.difficulty}

                      </span>

                    </div>



                    <div

                      className="prose-lesson text-sm sm:text-base"

                      dangerouslySetInnerHTML={{

                        __html: renderMarkdown(lesson.body_md),

                      }}

                    />



                    {canInteract && (

                      <div className="mt-5 rounded-lg border border-border-brand bg-bg-brand/60 p-4">

                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-soil-brand">

                          {t("quiz")}

                        </h3>

                        {lesson.questions.length > 0 ? (

                          <LessonQuiz

                            courseId={course.id}

                            lessonId={lesson.id}

                            questions={lesson.questions}

                            passingScore={course.passing_score}

                            alreadyComplete={complete}

                          />

                        ) : (

                          <CompleteLessonButton

                            courseId={course.id}

                            lessonId={lesson.id}

                            alreadyComplete={complete}

                          />

                        )}

                      </div>

                    )}



                    {!canInteract && lesson.questions.length > 0 && (

                      <div className="mt-5 rounded-lg border border-dashed border-border-brand bg-bg-brand/40 p-4 opacity-90">

                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-soil-brand">

                          {t("quiz")}

                        </h3>

                        <p className="mb-3 text-xs text-text-muted-brand">

                          {t("quizPreviewHint")}

                        </p>

                        <ol className="flex flex-col gap-3">

                          {lesson.questions.map((q) => (

                            <li key={q.id}>

                              <p className="text-sm font-medium text-text-brand">

                                {q.prompt}

                              </p>

                              <ul className="mt-1 flex flex-col gap-1">

                                {q.choices.map((choice, ci) => (

                                  <li

                                    key={ci}

                                    className="text-sm text-text-muted-brand"

                                  >

                                    {String.fromCharCode(65 + ci)}. {choice}

                                  </li>

                                ))}

                              </ul>

                            </li>

                          ))}

                        </ol>

                      </div>

                    )}

                  </div>

                </div>

              </li>

            );

          })}

        </ol>

      )}

    </div>

  );

}

