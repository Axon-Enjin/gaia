"use client";

import { useTranslations } from "next-intl";
import type { DisbursementAudit } from "@/lib/grants/programs";
import { buildAuditCsv } from "@/lib/grants/audit-export";

export function AuditExportButton({ audit }: { audit: DisbursementAudit }) {
  const t = useTranslations("Funder");

  function download() {
    const csv = buildAuditCsv(audit);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aniskwela-grant-audit-${audit.disbursement_id.slice(0, 8)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={download}
      className="btn btn-ghost border border-border-brand active:scale-[0.98]"
    >
      {t("exportAudit")}
    </button>
  );
}
