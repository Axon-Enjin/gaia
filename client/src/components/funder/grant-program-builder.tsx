"use client";

import { useActionState, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import type { GrantCriteria } from "@/lib/grants/criteria-schema";
import { GRANT_BADGE_TYPES } from "@/lib/grants/criteria-schema";
import type { GrantProgramRow } from "@/lib/grants/programs";
import {
  createGrantProgramAction,
  updateGrantProgramAction,
  type GrantProgramActionState,
} from "@/app/actions/grant-programs";
import {
  EligibilityPreviewPanel,
} from "@/components/funder/eligibility-preview-panel";

const initial: GrantProgramActionState = {};

export interface GrantProgramBuilderProps {
  mode: "create" | "edit";
  program?: GrantProgramRow;
}

export function GrantProgramBuilder({ mode, program }: GrantProgramBuilderProps) {
  const t = useTranslations("Funder");
  const action = mode === "create" ? createGrantProgramAction : updateGrantProgramAction;
  const [state, formAction, pending] = useActionState(action, initial);

  const [industry, setIndustry] = useState(program?.criteria.industry ?? "Agriculture");
  const [minXp, setMinXp] = useState(String(program?.criteria.min_xp ?? 300));
  const [badges, setBadges] = useState<string[]>(
    program?.criteria.required_badges ?? ["consistent_learner"],
  );
  const [requireCredential, setRequireCredential] = useState(
    program?.criteria.require_credential ?? false,
  );
  const [amount, setAmount] = useState(
    program?.amount_per_learner !== null && program?.amount_per_learner !== undefined
      ? String(program.amount_per_learner)
      : "2500",
  );

  const liveCriteria = useMemo((): GrantCriteria | null => {
    const xp = Number(minXp);
    if (!industry.trim() || !Number.isFinite(xp) || xp < 0) return null;
    return {
      industry: industry.trim(),
      min_xp: Math.floor(xp),
      required_badges: badges as GrantCriteria["required_badges"],
      require_credential: requireCredential,
    };
  }, [industry, minXp, badges, requireCredential]);

  const previewLabels = {
    title: t("previewTitle"),
    subtitle: t("previewSubtitle"),
    matchCountZero: t("matchCountZero"),
    loading: t("previewLoading"),
    error: t("previewError"),
    colName: t("colLearner"),
    colXp: t("colXp"),
    colBadges: t("colBadges"),
    empty: t("previewEmpty"),
  };

  function toggleBadge(badge: string) {
    setBadges((prev) =>
      prev.includes(badge) ? prev.filter((b) => b !== badge) : [...prev, badge],
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-5">
        <form action={formAction} className="flex flex-col gap-4">
          {mode === "edit" && program && (
            <input type="hidden" name="program_id" value={program.id} />
          )}

          <div className="field">
            <label htmlFor="name" className="field-label">
              {t("programNameLabel")}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={program?.name ?? t("defaultProgramName")}
              className="field-input"
            />
          </div>

          <div className="field">
            <label htmlFor="industry" className="field-label">
              {t("industryLabel")}
            </label>
            <input
              id="industry"
              name="industry"
              type="text"
              required
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="field-input"
            />
            <p className="field-hint">{t("industryHint")}</p>
          </div>

          <div className="field">
            <label htmlFor="min_xp" className="field-label">
              {t("minXpLabel")}
            </label>
            <input
              id="min_xp"
              name="min_xp"
              type="number"
              min={0}
              required
              value={minXp}
              onChange={(e) => setMinXp(e.target.value)}
              className="field-input font-mono tabular-nums"
            />
          </div>

          <fieldset className="field">
            <legend className="field-label">{t("badgesLabel")}</legend>
            <div className="mt-2 flex flex-col gap-2">
              {GRANT_BADGE_TYPES.map((badge) => (
                <label
                  key={badge}
                  className="flex cursor-pointer items-center gap-2 text-sm text-text-brand"
                >
                  <input
                    type="checkbox"
                    name="required_badges"
                    value={badge}
                    checked={badges.includes(badge)}
                    onChange={() => toggleBadge(badge)}
                    className="h-4 w-4 rounded border-border-brand text-primary-brand"
                  />
                  {t(`badges.${badge}`)}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="field">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-text-brand">
              <input
                type="checkbox"
                name="require_credential"
                checked={requireCredential}
                onChange={(e) => setRequireCredential(e.target.checked)}
                className="h-4 w-4 rounded border-border-brand text-primary-brand"
              />
              {t("requireCredentialLabel")}
            </label>
          </div>

          <div className="field">
            <label htmlFor="amount_per_learner" className="field-label">
              {t("amountLabel")}
            </label>
            <input
              id="amount_per_learner"
              name="amount_per_learner"
              type="number"
              min={1}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="field-input font-mono tabular-nums"
            />
            <p className="field-hint">{t("amountHint")}</p>
          </div>

          {state.error && (
            <p className="text-sm text-error-brand" role="alert">
              {(
                {
                  invalid_request: t("errors.invalid_request"),
                  unauthorized: t("errors.unauthorized"),
                  forbidden: t("errors.forbidden"),
                  create_failed: t("errors.create_failed"),
                  update_failed: t("errors.update_failed"),
                  delete_failed: t("errors.delete_failed"),
                } as Record<string, string>
              )[state.error] ?? t("errors.create_failed")}
            </p>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={pending}
              className="btn btn-primary active:scale-[0.98]"
            >
              {pending
                ? t("saving")
                : mode === "create"
                  ? t("createProgram")
                  : t("saveProgram")}
            </button>
            <Link href="/funder" className="btn btn-ghost border border-border-brand">
              {t("cancel")}
            </Link>
          </div>
        </form>
      </div>

      <div className="lg:col-span-7">
        <EligibilityPreviewPanel
          criteria={liveCriteria}
          labels={previewLabels}
        />
      </div>
    </div>
  );
}
