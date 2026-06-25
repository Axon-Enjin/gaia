import type { DisbursementAudit } from "@/lib/grants/programs";

/** Build a CSV audit export for a simulated disbursement (QAD H-05). */
export function buildAuditCsv(audit: DisbursementAudit): string {
  const headers = [
    "program_name",
    "program_id",
    "criteria_hash",
    "learner_id",
    "display_name",
    "total_xp",
    "badges",
    "matched_industry",
    "amount_per_learner",
    "simulated",
    "disbursed_at",
  ];

  const rows = audit.recipients.map((r) => [
    escapeCsv(audit.program_name),
    audit.program_id,
    audit.criteria_hash,
    r.learner_id,
    escapeCsv(r.display_name ?? ""),
    String(r.total_xp),
    escapeCsv(r.badge_types.join(";")),
    escapeCsv(r.matched_industry),
    audit.amount_per_learner !== null ? String(audit.amount_per_learner) : "",
    "true",
    audit.created_at,
  ]);

  if (rows.length === 0) {
    rows.push([
      escapeCsv(audit.program_name),
      audit.program_id,
      audit.criteria_hash,
      "",
      "",
      "",
      "",
      "",
      audit.amount_per_learner !== null ? String(audit.amount_per_learner) : "",
      "true",
      audit.created_at,
    ]);
  }

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
