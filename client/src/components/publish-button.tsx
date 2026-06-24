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
      <span className="shrink-0 text-sm font-semibold text-growth-strong-brand">
        {t("published")}
      </span>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="courseId" value={courseId} />
      <button
        type="submit"
        disabled={pending}
        className="btn btn-growth btn-sm"
      >
        {pending ? t("publishing") : t("publish")}
      </button>
      {state.error ? (
        <span role="alert" className="text-sm font-medium text-error-brand">
          {t(`publishError.${state.error}`)}
        </span>
      ) : null}
    </form>
  );
}
