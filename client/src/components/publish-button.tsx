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
    return <span className="text-sm text-green-700">{t("published")}</span>;
  }

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="courseId" value={courseId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-gray-900 px-3 py-1 text-sm text-white hover:bg-gray-800 disabled:opacity-60"
      >
        {pending ? t("publishing") : t("publish")}
      </button>
      {state.error ? (
        <span role="alert" className="text-sm text-red-700">
          {t(`publishError.${state.error}`)}
        </span>
      ) : null}
    </form>
  );
}
