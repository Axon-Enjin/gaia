"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  editorActionInitial,
  saveCourseSettingsAction,
  saveLessonAction,
  saveQuizQuestionAction,
} from "@/app/actions/course-editor";
import { PublishButton } from "@/components/publish-button";
import type { TeacherCourseEditorDetail } from "@/lib/courses/teacher";
import type { EditorQuestion } from "@/lib/courses/detail";

export function CourseEditorForm({
  course,
}: {
  course: TeacherCourseEditorDetail;
}) {
  const t = useTranslations("Teacher");

  return (
    <div className="flex flex-col gap-8">
      <CourseSettingsSection course={course} />
      {course.lessons.map((lesson, index) => (
        <LessonEditorSection
          key={lesson.id}
          courseId={course.id}
          lesson={lesson}
          lessonNumber={index + 1}
        />
      ))}
      <div className="flex flex-wrap items-center gap-3 border-t border-border-brand pt-6">
        <PublishButton courseId={course.id} />
        <Link
          href={`/teacher/courses/${course.id}`}
          className="text-sm font-medium text-primary-brand hover:underline"
        >
          {t("previewCourse")} →
        </Link>
      </div>
    </div>
  );
}

function CourseSettingsSection({
  course,
}: {
  course: TeacherCourseEditorDetail;
}) {
  const t = useTranslations("Teacher");
  const [state, action, pending] = useActionState(
    saveCourseSettingsAction,
    editorActionInitial,
  );

  return (
    <section className="callout-card">
      <h2 className="text-lg font-semibold text-soil-brand">{t("editorSettingsTitle")}</h2>
      <p className="mt-1 text-sm text-text-muted-brand">{t("editorSettingsHint")}</p>
      <form action={action} className="mt-5 flex flex-col gap-4">
        <input type="hidden" name="courseId" value={course.id} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-text-brand">{t("editorTitleLabel")}</span>
            <input
              name="title"
              defaultValue={course.title}
              required
              className="rounded-lg border border-border-brand bg-surface-brand px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-text-brand">{t("industryLabel")}</span>
            <input
              name="industry"
              defaultValue={course.industry}
              required
              className="rounded-lg border border-border-brand bg-surface-brand px-3 py-2"
            />
          </label>
        </div>
        <label className="flex max-w-xs flex-col gap-1.5 text-sm">
          <span className="font-medium text-text-brand">{t("editorPassingScoreLabel")}</span>
          <input
            name="passing_score"
            type="number"
            min={0}
            max={100}
            defaultValue={course.passing_score}
            required
            className="rounded-lg border border-border-brand bg-surface-brand px-3 py-2"
          />
          <span className="text-xs text-text-muted-brand">{t("editorPassingScoreHint")}</span>
        </label>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="site-btn site-btn-primary min-h-10"
          >
            {pending ? t("editorSaving") : t("editorSaveSettings")}
          </button>
          {state.ok && (
            <span className="text-sm text-growth-brand">{t("editorSaved")}</span>
          )}
          {state.error && (
            <span role="alert" className="text-sm text-error-brand">
              {t(`editorError.${state.error}`)}
            </span>
          )}
        </div>
      </form>
    </section>
  );
}

function LessonEditorSection({
  courseId,
  lesson,
  lessonNumber,
}: {
  courseId: string;
  lesson: TeacherCourseEditorDetail["lessons"][number];
  lessonNumber: number;
}) {
  const t = useTranslations("Teacher");
  const [state, action, pending] = useActionState(
    saveLessonAction,
    editorActionInitial,
  );

  return (
    <section className="rounded-xl border border-border-brand bg-surface-brand p-5">
      <h2 className="text-lg font-semibold text-soil-brand">
        {t("editorLessonTitle", { number: lessonNumber })}
      </h2>
      <form action={action} className="mt-4 flex flex-col gap-4">
        <input type="hidden" name="courseId" value={courseId} />
        <input type="hidden" name="lessonId" value={lesson.id} />
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text-brand">{t("editorLessonNameLabel")}</span>
          <input
            name="title"
            defaultValue={lesson.title}
            required
            className="rounded-lg border border-border-brand bg-bg-brand/50 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text-brand">{t("editorDifficultyLabel")}</span>
          <select
            name="difficulty"
            defaultValue={lesson.difficulty}
            className="rounded-lg border border-border-brand bg-bg-brand/50 px-3 py-2"
          >
            <option value="beginner">{t("editorDifficultyBeginner")}</option>
            <option value="intermediate">{t("editorDifficultyIntermediate")}</option>
            <option value="advanced">{t("editorDifficultyAdvanced")}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text-brand">{t("editorBodyLabel")}</span>
          <textarea
            name="body_md"
            defaultValue={lesson.body_md}
            required
            rows={8}
            className="rounded-lg border border-border-brand bg-bg-brand/50 px-3 py-2 font-mono text-sm"
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="site-btn min-h-10 rounded-lg border border-border-brand bg-surface-brand px-4 text-sm font-medium hover:bg-bg-brand/80 disabled:opacity-60"
          >
            {pending ? t("editorSaving") : t("editorSaveLesson")}
          </button>
          {state.ok && (
            <span className="text-sm text-growth-brand">{t("editorSaved")}</span>
          )}
          {state.error && (
            <span role="alert" className="text-sm text-error-brand">
              {t(`editorError.${state.error}`)}
            </span>
          )}
        </div>
      </form>

      {lesson.questions.length > 0 && (
        <div className="mt-6 border-t border-border-brand pt-6">
          <h3 className="text-sm font-semibold text-text-brand">{t("editorQuizSection")}</h3>
          <ul className="mt-4 flex flex-col gap-6">
            {lesson.questions.map((q: EditorQuestion, qi: number) => (
              <QuizEditorForm
                key={q.id}
                courseId={courseId}
                question={q}
                index={qi + 1}
              />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function QuizEditorForm({
  courseId,
  question,
  index,
}: {
  courseId: string;
  question: TeacherCourseEditorDetail["lessons"][number]["questions"][number];
  index: number;
}) {
  const t = useTranslations("Teacher");
  const [state, action, pending] = useActionState(
    saveQuizQuestionAction,
    editorActionInitial,
  );
  const [choices, setChoices] = useState<string[]>(
    question.choices.length >= 2 ? question.choices : [...question.choices, ""],
  );
  const [answerIndex, setAnswerIndex] = useState(question.answer_index);

  function updateChoice(i: number, value: string) {
    setChoices((prev) => prev.map((c, idx) => (idx === i ? value : c)));
  }

  const visibleChoices = choices.filter((_, i) => i < 4 || choices[i]?.trim());

  return (
    <li className="rounded-lg border border-border-brand/80 bg-bg-brand/30 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted-brand">
        {t("editorQuestionLabel", { number: index })}
      </p>
      <form action={action} className="mt-3 flex flex-col gap-3">
        <input type="hidden" name="courseId" value={courseId} />
        <input type="hidden" name="questionId" value={question.id} />
        <input type="hidden" name="choices" value={JSON.stringify(choices.filter((c) => c.trim()))} />
        <input type="hidden" name="answer_index" value={answerIndex} />
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text-brand">{t("editorPromptLabel")}</span>
          <input
            name="prompt"
            defaultValue={question.prompt}
            required
            className="rounded-lg border border-border-brand bg-surface-brand px-3 py-2"
          />
        </label>
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-text-brand">{t("editorChoicesLabel")}</legend>
          {visibleChoices.map((choice, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name={`correct-${question.id}`}
                checked={answerIndex === i}
                onChange={() => setAnswerIndex(i)}
                className="h-4 w-4"
              />
              <input
                value={choice}
                onChange={(e) => updateChoice(i, e.target.value)}
                required={i < 2}
                placeholder={t("editorChoicePlaceholder", { letter: String.fromCharCode(65 + i) })}
                className="min-w-0 flex-1 rounded-lg border border-border-brand bg-surface-brand px-3 py-2 text-sm"
              />
            </div>
          ))}
        </fieldset>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="text-sm font-medium text-primary-brand hover:underline disabled:opacity-60"
          >
            {pending ? t("editorSaving") : t("editorSaveQuestion")}
          </button>
          {state.ok && (
            <span className="text-sm text-growth-brand">{t("editorSaved")}</span>
          )}
          {state.error && (
            <span role="alert" className="text-sm text-error-brand">
              {t(`editorError.${state.error}`)}
            </span>
          )}
        </div>
      </form>
    </li>
  );
}
