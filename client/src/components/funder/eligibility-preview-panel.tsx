"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { GrantCriteria } from "@/lib/grants/criteria-schema";
import type { EligibleRecipient } from "@/lib/grants/evaluate";

export interface EligibilityPreviewLabels {
  title: string;
  subtitle: string;
  matchCountZero: string;
  loading: string;
  error: string;
  colName: string;
  colXp: string;
  colBadges: string;
  empty: string;
}

interface EligibilityPreviewPanelProps {
  criteria: GrantCriteria | null;
  labels: EligibilityPreviewLabels;
}

export function EligibilityPreviewPanel({
  criteria,
  labels,
}: EligibilityPreviewPanelProps) {
  const t = useTranslations("Funder");
  const [recipients, setRecipients] = useState<EligibleRecipient[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchPreview = useCallback(async () => {
    if (!criteria?.industry?.trim()) {
      setRecipients([]);
      setMatchCount(0);
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const res = await fetch("/api/grants/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ criteria }),
      });

      if (!res.ok) {
        setError(true);
        setRecipients([]);
        setMatchCount(0);
        return;
      }

      const data = (await res.json()) as {
        recipients: EligibleRecipient[];
        match_count: number;
      };
      setRecipients(data.recipients);
      setMatchCount(data.match_count);
    } catch {
      setError(true);
      setRecipients([]);
      setMatchCount(0);
    } finally {
      setLoading(false);
    }
  }, [criteria]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchPreview();
    }, 400);

    return () => clearTimeout(timer);
  }, [fetchPreview]);

  return (
    <section className="rounded-[var(--radius-surface)] border border-border-brand bg-surface-brand p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-soil-brand">{labels.title}</h2>
      <p className="mt-1 text-sm text-text-muted-brand">{labels.subtitle}</p>

      <p className="mt-4 font-mono text-2xl font-bold tabular-nums text-growth-strong-brand">
        {loading ? (
          <span className="text-base font-normal text-text-muted-brand">
            {labels.loading}
          </span>
        ) : error ? (
          <span className="text-base font-normal text-error-brand">
            {labels.error}
          </span>
        ) : matchCount === 0 ? (
          labels.matchCountZero
        ) : (
          t("matchCount", { count: matchCount })
        )}
      </p>

      {!loading && !error && recipients.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-brand text-xs font-semibold uppercase tracking-wide text-text-muted-brand">
                <th className="pb-2 pr-4">{labels.colName}</th>
                <th className="pb-2 pr-4">{labels.colXp}</th>
                <th className="pb-2">{labels.colBadges}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-brand">
              {recipients.map((row, i) => (
                <tr
                  key={row.learner_id}
                  className="grant-preview-row"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <td className="py-3 pr-4 font-medium text-text-brand">
                    {row.display_name ?? labels.colName}
                  </td>
                  <td className="py-3 pr-4 font-mono tabular-nums text-growth-strong-brand">
                    {row.total_xp.toLocaleString()}
                  </td>
                  <td className="py-3 text-xs text-text-muted-brand">
                    {row.badge_types.join(", ") || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && recipients.length === 0 && criteria?.industry && (
        <p className="mt-6 text-sm text-text-muted-brand">{labels.empty}</p>
      )}
    </section>
  );
}
