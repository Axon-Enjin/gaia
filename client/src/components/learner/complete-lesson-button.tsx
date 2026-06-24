"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export function CompleteLessonButton({
  courseId,
  lessonId,
  alreadyComplete,
}: {
  courseId: string;
  lessonId: string;
  alreadyComplete: boolean;
}) {
  const t = useTranslations("Learner");
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    alreadyComplete ? "done" : "idle",
  );

  if (state === "done" || alreadyComplete) {
    return (
      <p className="text-sm text-growth-brand">{t("lessonDone")}</p>
    );
  }

  async function complete() {
    setState("loading");
    try {
      const res = await fetch(
        `/api/enrollments/${courseId}/complete-lesson`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lesson_id: lessonId, answers: {} }),
        },
      );
      if (!res.ok) {
        setState("error");
        return;
      }
      setState("done");
      router.refresh();
    } catch {
      setState("error");
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={complete}
        disabled={state === "loading"}
        className="min-h-11 rounded-lg bg-primary-brand px-6 font-medium text-white hover:bg-primary-hover-brand disabled:opacity-60"
      >
        {state === "loading" ? t("submitting") : t("markComplete")}
      </button>
      {state === "error" && (
        <p className="mt-2 text-sm text-error-brand">{t("submitFailed")}</p>
      )}
    </div>
  );
}
