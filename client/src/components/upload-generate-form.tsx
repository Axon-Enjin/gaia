"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface DraftResult {
  course_id: string;
  status: string;
  title: string;
  lesson_count: number;
  quiz_count: number;
}

const INDUSTRIES = [
  "agriculture",
  "health",
  "finance",
  "technology",
  "education",
  "trades",
];

export function UploadGenerateForm() {
  const t = useTranslations("Teacher");
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
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="industry" className="text-sm font-medium">
          {t("industryLabel")}
        </label>
        <select
          id="industry"
          name="industry"
          required
          className="rounded border border-gray-300 px-3 py-2"
          defaultValue={INDUSTRIES[0]}
        >
          {INDUSTRIES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="title_hint" className="text-sm font-medium">
          {t("titleHintLabel")}
        </label>
        <input
          id="title_hint"
          name="title_hint"
          type="text"
          maxLength={300}
          className="rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="file" className="text-sm font-medium">
          {t("fileLabel")}
        </label>
        <input
          id="file"
          name="file"
          type="file"
          required
          accept=".pdf,.txt,.md,.markdown,text/plain,application/pdf"
          className="rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-gray-900 px-5 py-2.5 text-white hover:bg-gray-800 disabled:opacity-60"
      >
        {submitting ? t("generating") : t("generate")}
      </button>

      {error ? (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="rounded border border-green-300 bg-green-50 p-4">
          <p className="font-medium text-green-900">{t("draftReady")}</p>
          <p className="mt-1 text-sm text-gray-800">{result.title}</p>
          <p className="text-sm text-gray-700">
            {t("lessonsCount", { count: result.lesson_count })} ·{" "}
            {t("quizCount", { count: result.quiz_count })}
          </p>
          <p className="mt-2 text-sm text-gray-600">{t("review")}</p>
        </div>
      ) : null}
    </form>
  );
}
