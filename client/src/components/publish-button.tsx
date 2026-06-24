"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  publishCourseAction,
  type PublishState,
} from "@/app/actions/publish";

const initial: PublishState = {};

export function PublishButton({ courseId }: { courseId: string }) {
  const t = useTranslations("Teacher");
  const [state, formAction, pending] = useActionState(
    publishCourseAction,
    initial,
  );

  if (state.ok) {
    return (
      <span className="shrink-0 text-sm font-medium text-growth-brand">
        {t("published")}
      </span>
    );
  }

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="courseId" value={courseId} />
      <button
        type="submit"
        disabled={pending}
        className="min-h-9 rounded-lg bg-growth-brand px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
      >
        {pending ? t("publishing") : t("publish")}
      </button>
      {state.error ? (
        <span role="alert" className="text-sm text-error-brand">
          {t(`publishError.${state.error}`)}
        </span>
      ) : null}
    </form>
  );
}
