"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { deleteGrantProgramAction } from "@/app/actions/grant-programs";

export function DeleteGrantProgramButton({
  programId,
  programName,
}: {
  programId: string;
  programName: string;
}) {
  const t = useTranslations("Funder");
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteGrantProgramAction(programId);
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-error-brand hover:underline"
      >
        {t("deleteProgram")}
      </button>
    );
  }

  return (
    <div className="rounded-[var(--radius-surface)] border border-error-brand/30 bg-error-brand/5 p-4">
      <p className="text-sm text-soil-brand">
        {t("deleteConfirm", { name: programName })}
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={handleDelete}
          className="btn btn-ghost border border-error-brand text-error-brand active:scale-[0.98]"
        >
          {pending ? t("deleting") : t("confirmDelete")}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn btn-ghost border border-border-brand"
        >
          {t("cancel")}
        </button>
      </div>
    </div>
  );
}
