"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { DisbursementAudit } from "@/lib/grants/programs";
import { formatLocaleNumber } from "@/lib/i18n/format";
import { AuditExportButton } from "@/components/funder/audit-export-button";

export function SimulateDisburseButton({ programId }: { programId: string }) {
  const t = useTranslations("Funder");
  const locale = useLocale();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audit, setAudit] = useState<DisbursementAudit | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function runDisburse() {
    setPending(true);
    setError(null);

    try {
      const res = await fetch("/api/grants/disburse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ program_id: programId }),
      });

      if (!res.ok) {
        setError(t("disburseError"));
        return;
      }

      const data = (await res.json()) as { audit: DisbursementAudit };
      setAudit(data.audit);
      setConfirmOpen(false);
      router.refresh();
    } catch {
      setError(t("disburseError"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-8 border-t border-border-brand pt-8">
      <h2 className="text-lg font-semibold text-soil-brand">{t("disburseTitle")}</h2>
      <p className="mt-1 text-sm text-text-muted-brand">{t("disburseSubtitle")}</p>

      {!audit && !confirmOpen && (
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="btn btn-primary mt-4 active:scale-[0.98]"
        >
          {t("runSimulation")}
        </button>
      )}

      {confirmOpen && !audit && (
        <div
          className="mt-4 rounded-[var(--radius-surface)] border border-border-brand bg-bg-brand/50 p-4"
          role="dialog"
          aria-labelledby="disburse-confirm-title"
        >
          <p id="disburse-confirm-title" className="text-sm font-medium text-soil-brand">
            {t("disburseConfirm")}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={pending}
              onClick={() => void runDisburse()}
              className="btn btn-primary active:scale-[0.98]"
            >
              {pending ? t("disbursing") : t("confirmSimulation")}
            </button>
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="btn btn-ghost border border-border-brand"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-error-brand" role="alert">
          {error}
        </p>
      )}

      {audit && (
        <div className="mt-4 space-y-4">
          <div
            className="rounded-[var(--radius-surface)] border border-warning-brand/40 bg-warning-brand/10 px-4 py-3 text-sm text-soil-brand"
            role="status"
          >
            {t("disburseSuccessBanner")}
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-text-muted-brand">{t("recipientsLabel")}</dt>
              <dd className="font-mono text-xl font-bold tabular-nums text-growth-strong-brand">
                {audit.recipient_count}
              </dd>
            </div>
            {audit.total_simulated_amount !== null && (
              <div>
                <dt className="text-text-muted-brand">{t("totalSimulated")}</dt>
                <dd className="font-mono text-xl font-bold tabular-nums text-text-brand">
                  {formatLocaleNumber(locale, audit.total_simulated_amount)}
                </dd>
              </div>
            )}
            <div className="col-span-2 sm:col-span-1">
              <dt className="text-text-muted-brand">{t("criteriaHashLabel")}</dt>
              <dd className="truncate font-mono text-xs text-text-muted-brand">
                {audit.criteria_hash.slice(0, 16)}…
              </dd>
            </div>
          </dl>
          <AuditExportButton audit={audit} />
        </div>
      )}
    </div>
  );
}
