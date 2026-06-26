"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PublishButton } from "@/components/publish-button";
import { IconSpark, IconArrowRight, IconUpload, IconCheck } from "@/components/icons";

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
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    }
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const name = droppedFile.name.toLowerCase();
      if (
        name.endsWith(".pdf") ||
        name.endsWith(".txt") ||
        name.endsWith(".md") ||
        name.endsWith(".markdown") ||
        droppedFile.type === "application/pdf" ||
        droppedFile.type === "text/plain"
      ) {
        setFile(droppedFile);
        if (fileInputRef.current) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(droppedFile);
          fileInputRef.current.files = dataTransfer.files;
        }
      } else {
        setError(t("errorFile"));
      }
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  }

  function onButtonClick() {
    fileInputRef.current?.click();
  }

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
        <label className="field-label mb-2 block text-sm font-semibold text-text-brand">
          {t("fileLabel")}
        </label>
        
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition cursor-pointer text-center ${
            isDragActive
              ? "border-growth-strong-brand bg-growth-brand/8 scale-[0.99] shadow-inner"
              : file
              ? "border-growth-brand/50 bg-growth-brand/5"
              : "border-border-brand bg-white hover:border-soil-brand/60 hover:bg-soil-brand/5"
          }`}
        >
          <input
            ref={fileInputRef}
            id="file"
            name="file"
            type="file"
            required={!file}
            accept=".pdf,.txt,.md,.markdown,text/plain,application/pdf"
            onChange={handleChange}
            className="hidden"
          />

          {file ? (
            <div className="flex flex-col items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-growth-brand/15 text-2xl text-growth-strong-brand animate-pulse">
                <IconCheck />
              </span>
              <div className="max-w-xs">
                <p className="font-semibold text-text-brand truncate text-sm">
                  {file.name}
                </p>
                <p className="text-xs text-text-muted-brand mt-0.5">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-xs font-bold text-error-brand hover:underline mt-1"
              >
                {t("removeFile")}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-soil-brand/10 text-2xl text-soil-brand">
                <IconUpload />
              </span>
              <div>
                <p className="text-sm font-bold text-soil-brand">
                  {t("dragDropLabel")}{" "}
                  <span className="text-primary-brand hover:underline">{t("browse")}</span>
                </p>
                <p className="text-xs text-text-muted-brand mt-1.5">
                  {t("fileLimitHint")}
                </p>
              </div>
            </div>
          )}
        </div>
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
