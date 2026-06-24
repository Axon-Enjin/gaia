"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export function EnrollButton({ courseId }: { courseId: string }) {
  const t = useTranslations("Learner");
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );

  async function enroll() {
    setState("loading");
    try {
      const res = await fetch(`/api/enrollments/${courseId}/enroll`, {
        method: "POST",
      });
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

  if (state === "done") {
    return (
      <p className="inline-alert inline-alert--success" role="status">
        {t("enrolled")}
      </p>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={enroll}
        disabled={state === "loading"}
        className="btn btn-growth"
      >
        {state === "loading" ? t("enrolling") : t("enroll")}
      </button>
      {state === "error" && (
        <p className="inline-alert inline-alert--error mt-2" role="alert">
          {t("submitFailed")}
        </p>
      )}
    </>
  );
}
