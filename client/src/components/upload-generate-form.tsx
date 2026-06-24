"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PublishButton } from "@/components/publish-button";

interface DraftResult {
  course_id: string;
  status: string;
  title: string;
  industry: string;
  lesson_count: number;
  quiz_count: number;
}

export function UploadGenerateForm() {
  const t = useTranslations("Teacher");
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DraftResult | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setSubmitting(true);

    try {
      const form = new FormData(event.currentTarget);
      const res = await fetch("/api/courses/generate", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (res.status === 422) setError(t("errorSchema"));
        else if (res.status === 400 && body.error === "bad_file")
          setError(t("errorFile"));
        else setError(t("errorGeneric"));
        return;
      }

      setResult((await res.json()) as DraftResult);
      router.refresh();
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <p className="text-sm text-text-muted-brand">{t("uploadAutoMetaHint")}</p>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="file" className="text-sm font-medium text-text-brand">
          {t("fileLabel")}
        </label>
        <input
          id="file"
          name="file"
          type="file"
          required
          accept=".pdf,.txt,.md,.markdown,text/plain,application/pdf"
          className="rounded-lg border border-border-brand bg-surface-brand px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-growth-brand/10 file:px-3 file:py-1 file:text-sm file:font-medium file:text-growth-brand"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="min-h-11 rounded-lg bg-growth-brand px-5 py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-60"
      >
        {submitting ? t("generating") : t("generate")}
      </button>

      {error ? (
        <p role="alert" className="text-sm text-error-brand">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="rounded-xl border border-growth-brand/35 bg-growth-brand/10 p-4">
          <p className="font-medium text-growth-brand">{t("draftReady")}</p>
          <p className="mt-1 text-sm text-text-brand">{result.title}</p>
          <p className="text-sm text-text-muted-brand">
            {t("draftIndustry", { industry: result.industry })} ·{" "}
            {t("lessonsCount", { count: result.lesson_count })} ·{" "}
            {t("quizCount", { count: result.quiz_count })}
          </p>
          <p className="mt-2 text-sm text-text-muted-brand">{t("reviewHint")}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <PublishButton courseId={result.course_id} />
            <Link
              href={`/teacher/courses/${result.course_id}`}
              className="text-sm font-medium text-primary-brand hover:underline"
            >
              {t("previewCourse")} →
            </Link>
          </div>
        </div>
      ) : null}
    </form>
  );
}
