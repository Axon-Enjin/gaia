"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { DetailQuestion } from "@/lib/courses/detail";

interface LessonQuizProps {
  courseId: string;
  lessonId: string;
  questions: DetailQuestion[];
  passingScore: number;
  alreadyComplete: boolean;
}

export function LessonQuiz({
  courseId,
  lessonId,
  questions,
  passingScore,
  alreadyComplete,
}: LessonQuizProps) {
  const t = useTranslations("Learner");
  const router = useRouter();
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [state, setState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<{
    xp: number;
    courseCompleted: boolean;
  } | null>(null);

  if (questions.length === 0) {
    return (
      <p className="text-sm text-text-muted-brand">{t("noQuiz")}</p>
    );
  }

  if (alreadyComplete) {
    return (
      <p className="rounded-lg border border-growth-brand/30 bg-growth-brand/10 px-4 py-3 text-sm text-growth-brand">
        {t("lessonDone")}
      </p>
    );
  }

  if (state === "success" && result) {
    return (
      <p className="rounded-lg border border-growth-brand/30 bg-growth-brand/10 px-4 py-3 text-sm text-growth-brand">
        {result.courseCompleted
          ? t("courseComplete", { xp: result.xp })
          : t("lessonComplete", { xp: result.xp })}
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "submitting") return;

    for (const q of questions) {
      if (selections[q.id] === undefined) {
        setErrorMsg(t("answerAll"));
        setState("error");
        return;
      }
    }

    setState("submitting");
    setErrorMsg(null);

    try {
      const res = await fetch(
        `/api/enrollments/${courseId}/complete-lesson`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lesson_id: lessonId, answers: selections }),
        },
      );
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
        xp_awarded?: number;
        streak_bonus?: number;
        course_completed?: boolean;
      };

      if (!res.ok) {
        if (data.error === "invalid_quiz") {
          setErrorMsg(
            data.message ?? t("quizFailed", { score: passingScore }),
          );
        } else if (data.error === "unauthorized") {
          setErrorMsg(t("signInRequired"));
        } else {
          setErrorMsg(t("submitFailed"));
        }
        setState("error");
        return;
      }

      const xp = (data.xp_awarded ?? 0) + (data.streak_bonus ?? 0);
      setResult({ xp, courseCompleted: Boolean(data.course_completed) });
      setState("success");
      router.refresh();
    } catch {
      setErrorMsg(t("networkError"));
      setState("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-text-muted-brand">
        {t("passingHint", { score: passingScore })}
      </p>
      <ol className="flex flex-col gap-4">
        {questions.map((q, qi) => (
          <li key={q.id}>
            <p className="mb-2 text-sm font-medium text-text-brand">
              {qi + 1}. {q.prompt}
            </p>
            <ul className="flex flex-col gap-2">
              {q.choices.map((choice, ci) => (
                <li key={ci}>
                  <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-border-brand px-3 py-2 hover:bg-bg-brand">
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={selections[q.id] === ci}
                      onChange={() =>
                        setSelections((s) => ({ ...s, [q.id]: ci }))
                      }
                      className="mt-1"
                    />
                    <span className="text-sm">{choice}</span>
                  </label>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <button
        type="submit"
        disabled={state === "submitting"}
        className="min-h-11 w-fit rounded-lg bg-primary-brand px-6 font-medium text-white hover:bg-primary-hover-brand disabled:opacity-60"
      >
        {state === "submitting" ? t("submitting") : t("submitQuiz")}
      </button>
      {state === "error" && errorMsg && (
        <p className="text-sm text-error-brand" role="alert">
          {errorMsg}
        </p>
      )}
    </form>
  );
}
