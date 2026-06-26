"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  deleteCourseAction,
  type DeleteCourseState,
} from "@/app/actions/delete-course";
import { IconTrash } from "@/components/icons";

const initial: DeleteCourseState = {};

export function DeleteCourseButton({
  courseId,
  courseTitle,
  variant = "inline",
}: {
  courseId: string;
  courseTitle: string;
  variant?: "inline" | "destructive" | "icon";
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
      ? "btn btn-sm border border-error-brand/40 bg-error-brand/5 text-error-brand hover:bg-error-brand/10"
      : variant === "icon"
      ? "flex h-9 w-9 items-center justify-center rounded-lg hover:bg-error-brand/10 text-error-brand transition disabled:opacity-60"
      : "text-sm font-medium text-error-brand hover:underline disabled:opacity-60";

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={pending}
        className={triggerClassName}
        title={variant === "icon" ? t("deleteCourse") : undefined}
        aria-label={t("deleteCourse")}
      >
        {variant === "icon" ? (
          <IconTrash className="text-lg" />
        ) : pending ? (
          t("deleting")
        ) : (
          t("deleteCourse")
        )}
      </button>

      {state.error && !open ? (
        <span role="alert" className="text-xs text-error-brand">
          {t(`deleteError.${state.error}`)}
        </span>
      ) : null}

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(36, 31, 26, 0.4)" }}
          onClick={closeDialog}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-md rounded-[var(--radius-lg)] border border-border-brand bg-surface-brand p-5 shadow-[var(--shadow-lg)]"
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

              <div className="field">
                <label
                  htmlFor={`delete-confirm-${courseId}`}
                  className="field-label"
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
                  className="field-input"
                />
              </div>

              {state.error ? (
                <span role="alert" className="inline-alert inline-alert--error">
                  {t(`deleteError.${state.error}`)}
                </span>
              ) : null}

              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={pending}
                  className="btn btn-ghost btn-sm border border-border-brand"
                >
                  {t("deleteConfirmCancel")}
                </button>
                <button
                  type="submit"
                  disabled={pending || !phraseMatches}
                  className="btn btn-destructive btn-sm"
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
