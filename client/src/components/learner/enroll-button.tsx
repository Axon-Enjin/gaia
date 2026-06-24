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
      <p className="text-sm text-growth-brand">{t("enrolled")}</p>
    );
  }

  return (
    <button
      type="button"
      onClick={enroll}
      disabled={state === "loading"}
      className="min-h-11 rounded-lg bg-growth-brand px-6 font-medium text-white hover:opacity-90 disabled:opacity-60"
    >
      {state === "loading" ? t("enrolling") : t("enroll")}
    </button>
  );
}
