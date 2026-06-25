"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PublishButton } from "@/components/publish-button";
import { IconSpark, IconArrowRight } from "@/components/icons";

interface DraftResult {
  course_id: string;
  status: string;
  title: string;
  industry: string;
  lesson_count: number;
  quiz_count: number;
  preprocess?: {
    raw_chars: number;
    digest_chars: number;
    prepared_chars: number;
    reduction_pct: number;
    mini_distill_used: boolean;
  };
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

      const data = (await res.json()) as DraftResult;
      const p = data.preprocess;
      const qs = p
        ? `?raw_chars=${p.raw_chars}&prepared_chars=${p.prepared_chars}&reduction_pct=${p.reduction_pct}`
        : "";
      router.push(`/teacher/courses/${data.course_id}/edit${qs}`);
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

      <div className="field">
        <label htmlFor="file" className="field-label">
          {t("fileLabel")}
        </label>
        <input
          id="file"
          name="file"
          type="file"
          required
          accept=".pdf,.txt,.md,.markdown,text/plain,application/pdf"
          className="field-input text-sm file:mr-3 file:rounded file:border-0 file:bg-growth-brand/10 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-growth-strong-brand"
        />
      </div>

      <button type="submit" disabled={submitting} className="btn btn-growth w-fit">
        <IconSpark aria-hidden="true" />
        {submitting ? t("generating") : t("generate")}
      </button>

      {error ? (
        <p role="alert" className="inline-alert inline-alert--error">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="rounded-[var(--radius-surface)] border border-growth-brand/35 bg-growth-brand/8 p-4">
          <p className="font-semibold text-growth-strong-brand">
            {t("draftReady")}
          </p>
          <p className="mt-1 text-sm font-medium text-text-brand">
            {result.title}
          </p>
          <p className="text-sm text-text-muted-brand">
            {t("draftIndustry", { industry: result.industry })} ·{" "}
            {t("lessonsCount", { count: result.lesson_count })} ·{" "}
            {t("quizCount", { count: result.quiz_count })}
          </p>
          <p className="mt-2 text-sm text-text-muted-brand">{t("reviewHint")}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href={`/teacher/courses/${result.course_id}/edit`}
              className="btn btn-primary btn-sm"
            >
              {t("editCourse")}
              <IconArrowRight aria-hidden="true" />
            </Link>
            <PublishButton courseId={result.course_id} />
          </div>
        </div>
      ) : null}
    </form>
  );
}
