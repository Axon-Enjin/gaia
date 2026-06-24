"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  deleteCourseAction,
  type DeleteCourseState,
} from "@/app/actions/delete-course";

const initial: DeleteCourseState = {};

export function DeleteCourseButton({
  courseId,
  courseTitle,
  variant = "inline",
}: {
  courseId: string;
  courseTitle: string;
  variant?: "inline" | "destructive";
}) {
  const t = useTranslations("Teacher");
  const router = useRouter();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [state, formAction, pending] = useActionState(
    deleteCourseAction,
    initial,
  );

  const confirmPhrase = t("deleteConfirmPhrase");
  const phraseMatches = confirmText === confirmPhrase;

  useEffect(() => {
    if (state.ok) {
      router.push("/teacher/courses");
      router.refresh();
    }
  }, [state.ok, router]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) {
        setOpen(false);
        setConfirmText("");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, pending]);

  function closeDialog() {
    if (pending) return;
    setOpen(false);
    setConfirmText("");
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!phraseMatches) return;
    const formData = new FormData(event.currentTarget);
    formAction(formData);
  }

  const triggerClassName =
    variant === "destructive"
      ? "min-h-9 rounded-lg border border-error-brand/40 bg-error-brand/5 px-3 py-1.5 text-sm font-medium text-error-brand hover:bg-error-brand/10 disabled:opacity-60"
      : "text-sm font-medium text-error-brand hover:underline disabled:opacity-60";

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={pending}
        className={triggerClassName}
      >
        {pending ? t("deleting") : t("deleteCourse")}
      </button>

      {state.error && !open ? (
        <span role="alert" className="text-xs text-error-brand">
          {t(`deleteError.${state.error}`)}
        </span>
      ) : null}

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeDialog}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-md rounded-xl border border-border-brand bg-surface-brand p-5 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              id={titleId}
              className="text-lg font-semibold text-text-brand"
            >
              {t("deleteConfirmTitle")}
            </h2>
            <p className="mt-2 text-sm text-text-muted-brand">
              {t("deleteConfirm", { title: courseTitle })}
            </p>

            <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4">
              <input type="hidden" name="courseId" value={courseId} />

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor={`delete-confirm-${courseId}`}
                  className="text-sm font-medium text-text-brand"
                >
                  {t("deleteConfirmLabel", { phrase: confirmPhrase })}
                </label>
                <input
                  id={`delete-confirm-${courseId}`}
                  type="text"
                  value={confirmText}
                  onChange={(event) => setConfirmText(event.target.value)}
                  autoComplete="off"
                  autoFocus
                  className="rounded-lg border border-border-brand bg-surface-brand px-3 py-2 text-sm text-text-brand"
                />
              </div>

              {state.error ? (
                <span role="alert" className="text-sm text-error-brand">
                  {t(`deleteError.${state.error}`)}
                </span>
              ) : null}

              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={pending}
                  className="min-h-9 rounded-lg border border-border-brand px-3 py-1.5 text-sm font-medium text-text-brand hover:bg-gray-50 disabled:opacity-60"
                >
                  {t("deleteConfirmCancel")}
                </button>
                <button
                  type="submit"
                  disabled={pending || !phraseMatches}
                  className="min-h-9 rounded-lg bg-error-brand px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
                >
                  {pending ? t("deleting") : t("deleteCourse")}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
