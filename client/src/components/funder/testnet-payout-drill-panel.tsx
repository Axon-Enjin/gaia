"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  connectFreighter,
  isTestnetWalletState,
  readFreighterState,
  signFreighterTransaction,
  type WalletConnectionState,
} from "@/lib/wallet/freighter";
import type {
  PayoutDrillReadiness,
  PreparedPayoutDrill,
  SubmitPayoutDrillResult,
} from "@/lib/grants/payout-drill";
import { formatLocaleDate, formatLocaleNumber } from "@/lib/i18n/format";
import { stellarExplorerTxUrl } from "@/lib/credentials/stellar-explorer";
import {
  IconArrowRight,
  IconExternalLink,
  IconRefresh,
  IconShieldCheck,
} from "@/components/icons";

export function TestnetPayoutDrillPanel({
  programId,
  readiness,
}: {
  programId: string;
  readiness: PayoutDrillReadiness;
}) {
  const t = useTranslations("Funder");
  const locale = useLocale();
  const router = useRouter();
  const [state, setState] = useState<WalletConnectionState>({ status: "checking" });
  const [pending, startTransition] = useTransition();
  const [amount, setAmount] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [prepared, setPrepared] = useState<PreparedPayoutDrill | null>(null);
  const [submitted, setSubmitted] = useState<SubmitPayoutDrillResult | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    void readFreighterState().then((next) => {
      if (active) setState(next);
    });
    return () => {
      active = false;
    };
  }, []);

  function refreshState() {
    setError(null);
    startTransition(() => {
      void readFreighterState().then(setState);
    });
  }

  function handleConnect() {
    setError(null);
    setState({ status: "connecting" });
    startTransition(() => {
      void connectFreighter().then(setState);
    });
  }

  const canPrepare =
    readiness.available &&
    readiness.latestDisbursementId &&
    readiness.recipientsWithWallets > 0 &&
    isTestnetWalletState(state);

  const skippedRecipients = useMemo(
    () => prepared?.recipients.filter((recipient) => !recipient.included) ?? [],
    [prepared],
  );

  async function prepare() {
    if (!isTestnetWalletState(state) || !readiness.latestDisbursementId) {
      setError(t("payoutDrill.errors.invalid_network"));
      return;
    }

    setPreparing(true);
    setError(null);
    setPrepared(null);
    setSubmitted(null);

    try {
      const res = await fetch("/api/grants/payout-drill/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          program_id: programId,
          source_disbursement_id: readiness.latestDisbursementId,
          funder_address: state.address,
          demo_amount_xlm: amount,
        }),
      });

      const data = (await res.json()) as PreparedPayoutDrill & { error?: string };
      if (!res.ok || data.error) {
        setError(
          data.error
            ? t(`payoutDrill.errors.${data.error}`)
            : t("payoutDrill.errors.prepare_failed"),
        );
        return;
      }

      setPrepared(data);
    } catch {
      setError(t("payoutDrill.errors.prepare_failed"));
    } finally {
      setPreparing(false);
    }
  }

  async function signAndSubmit() {
    if (!prepared || !isTestnetWalletState(state)) {
      setError(t("payoutDrill.errors.invalid_network"));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const signed = await signFreighterTransaction(prepared.transactionXdr, {
        address: state.address,
        networkPassphrase: state.networkPassphrase,
      });

      if (!signed.ok) {
        setError(t(`payoutDrill.errors.${signed.code}`));
        return;
      }

      const res = await fetch("/api/grants/payout-drill/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drill_id: prepared.drillId,
          signed_xdr: signed.signedTxXdr,
          signer_address: signed.signerAddress,
        }),
      });

      const data = (await res.json()) as SubmitPayoutDrillResult & { error?: string };
      if (!res.ok || data.error) {
        setError(
          data.error
            ? t(`payoutDrill.errors.${data.error}`)
            : t("payoutDrill.errors.submit_failed"),
        );
        return;
      }

      setSubmitted(data);
      router.refresh();
    } catch {
      setError(t("payoutDrill.errors.submit_failed"));
    } finally {
      setSubmitting(false);
    }
  }

  const latestDrillUrl = readiness.latestDrill?.txHash
    ? stellarExplorerTxUrl("testnet", readiness.latestDrill.txHash)
    : null;
  const submittedUrl = submitted
    ? stellarExplorerTxUrl(submitted.network, submitted.txHash)
    : null;

  return (
    <section className="mt-8 border-t border-border-brand pt-8">
      <div className="rounded-[var(--radius-surface)] border border-primary-brand/25 bg-primary-brand/5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary-brand/12 px-2.5 py-1 text-xs font-semibold text-primary-brand">
                {t("payoutDrill.badge")}
              </span>
              <span className="rounded-full bg-warning-brand/15 px-2.5 py-1 text-xs font-semibold text-soil-brand">
                {t("payoutDrill.testnetOnly")}
              </span>
            </div>
            <h2 className="mt-3 text-lg font-semibold text-soil-brand">
              {t("payoutDrill.title")}
            </h2>
            <p className="mt-1 text-sm text-text-muted-brand">{t("payoutDrill.subtitle")}</p>
          </div>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-brand/10 text-primary-brand">
            <IconShieldCheck aria-hidden="true" />
          </span>
        </div>

        <div className="mt-4 rounded-[var(--radius-control)] border border-border-brand bg-white/65 p-4">
          {!readiness.available && (
            <p className="text-sm text-text-muted-brand">{t("payoutDrill.unavailable")}</p>
          )}

          {readiness.available && (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-muted-brand">
                    {t("payoutDrill.latestSimulation")}
                  </p>
                  <p className="mt-1 font-mono text-xl font-bold text-growth-strong-brand">
                    {readiness.latestSimulationRecipientCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-muted-brand">
                    {t("payoutDrill.readyRecipients")}
                  </p>
                  <p className="mt-1 font-mono text-xl font-bold text-text-brand">
                    {readiness.recipientsWithWallets}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-muted-brand">
                    {t("payoutDrill.missingRecipients")}
                  </p>
                  <p className="mt-1 font-mono text-xl font-bold text-warning-strong-brand">
                    {readiness.recipientsMissingWallets}
                  </p>
                </div>
              </div>

              {readiness.latestDisbursementCreatedAt && (
                <p className="mt-3 text-sm text-text-muted-brand">
                  {t("payoutDrill.latestSimulationDate", {
                    date: formatLocaleDate(locale, readiness.latestDisbursementCreatedAt),
                  })}
                </p>
              )}

              {readiness.latestDrill && (
                <div className="mt-4 rounded-[var(--radius-control)] border border-border-brand bg-bg-brand/60 p-3">
                  <p className="text-sm font-medium text-soil-brand">
                    {t("payoutDrill.latestDrill", {
                      count: readiness.latestDrill.recipientCount,
                      amount: readiness.latestDrill.totalAmountXlm,
                    })}
                  </p>
                  <p className="mt-1 text-xs text-text-muted-brand">
                    {t("payoutDrill.latestDrillDate", {
                      date: formatLocaleDate(locale, readiness.latestDrill.createdAt),
                    })}
                  </p>
                  {latestDrillUrl && (
                    <a
                      href={latestDrillUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary-brand hover:underline"
                    >
                      {t("payoutDrill.viewLatest")}
                      <IconExternalLink aria-hidden="true" />
                    </a>
                  )}
                </div>
              )}

              <div className="mt-4 rounded-[var(--radius-control)] border border-border-brand bg-bg-brand/55 p-4">
                <p className="text-sm font-medium text-text-brand">{t("payoutDrill.walletTitle")}</p>
                {state.status === "checking" && (
                  <p className="mt-2 text-sm text-text-muted-brand">{t("checking")}</p>
                )}
                {state.status === "not_installed" && (
                  <p className="mt-2 text-sm text-text-muted-brand">{t("notInstalledBody")}</p>
                )}
                {state.status === "disconnected" && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button type="button" onClick={handleConnect} className="btn btn-primary btn-sm">
                      {t("connect")}
                    </button>
                  </div>
                )}
                {state.status === "connecting" && (
                  <p className="mt-2 text-sm text-text-muted-brand">{t("connecting")}</p>
                )}
                {state.status === "connected" && (
                  <div className="mt-3 space-y-2">
                    <p className="font-mono text-sm text-text-brand break-all">{state.address}</p>
                    <p className="text-sm text-text-muted-brand">
                      {t("networkValue", {
                        network: state.network,
                        shortAddress: state.shortAddress,
                      })}
                    </p>
                    {!isTestnetWalletState(state) && (
                      <p className="text-sm text-warning-strong-brand">
                        {t("payoutDrill.errors.invalid_network")}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={refreshState}
                      disabled={pending}
                      className="btn btn-ghost border border-border-brand btn-sm"
                    >
                      <IconRefresh aria-hidden="true" />
                      {t("refresh")}
                    </button>
                  </div>
                )}
                {state.status === "error" && (
                  <p className="mt-2 text-sm text-error-brand">{t(`errors.${state.code}`)}</p>
                )}
              </div>

              <div className="mt-4">
                <label htmlFor="demo_amount_xlm" className="field-label">
                  {t("payoutDrill.amountLabel")}
                </label>
                <input
                  id="demo_amount_xlm"
                  type="number"
                  min="0.0000001"
                  step="0.0000001"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="field-input mt-2 font-mono tabular-nums"
                />
                <p className="mt-2 text-sm text-text-muted-brand">{t("payoutDrill.amountHint")}</p>
              </div>

              {!readiness.latestDisbursementId && (
                <p className="mt-4 text-sm text-text-muted-brand">{t("payoutDrill.noSimulation")}</p>
              )}

              {error && (
                <p className="mt-4 text-sm text-error-brand" role="alert">
                  {error}
                </p>
              )}

              {!prepared && !submitted && (
                <button
                  type="button"
                  onClick={() => void prepare()}
                  disabled={!canPrepare || preparing}
                  className="btn btn-primary mt-4"
                >
                  {preparing ? t("payoutDrill.preparing") : t("payoutDrill.prepare")}
                </button>
              )}

              {prepared && !submitted && (
                <div className="mt-5 rounded-[var(--radius-control)] border border-border-brand bg-white/75 p-4">
                  <p className="text-sm font-medium text-soil-brand">
                    {t("payoutDrill.prepared", {
                      count: prepared.recipientCount,
                      total: prepared.totalAmountXlm,
                    })}
                  </p>
                  <p className="mt-2 text-sm text-text-muted-brand">
                    {t("payoutDrill.skippedCount", {
                      count: skippedRecipients.length,
                    })}
                  </p>

                  {skippedRecipients.length > 0 && (
                    <ul className="mt-3 space-y-2 text-sm text-text-muted-brand">
                      {skippedRecipients.map((recipient) => (
                        <li
                          key={recipient.learnerId}
                          className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] border border-border-brand bg-bg-brand/60 px-3 py-2"
                        >
                          <span>{recipient.displayName ?? t("colLearner")}</span>
                          <span>{t("payoutDrill.skippedMissingWallet")}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void signAndSubmit()}
                      disabled={submitting || !isTestnetWalletState(state)}
                      className="btn btn-primary"
                    >
                      {submitting ? t("payoutDrill.submitting") : t("payoutDrill.signAndSubmit")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPrepared(null);
                        setSubmitted(null);
                        setError(null);
                      }}
                      disabled={submitting}
                      className="btn btn-ghost border border-border-brand"
                    >
                      {t("cancel")}
                    </button>
                  </div>
                </div>
              )}

              {submitted && (
                <div className="mt-5 rounded-[var(--radius-control)] border border-growth-brand/30 bg-growth-brand/10 p-4">
                  <p className="text-sm font-medium text-growth-strong-brand">
                    {t("payoutDrill.success", {
                      count: submitted.recipientCount,
                      total: submitted.totalAmountXlm,
                    })}
                  </p>
                  <p className="mt-2 font-mono text-sm text-text-brand break-all">
                    {submitted.txHash}
                  </p>
                  {submittedUrl && (
                    <a
                      href={submittedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-brand hover:underline"
                    >
                      {t("payoutDrill.viewOnExplorer")}
                      <IconExternalLink aria-hidden="true" />
                    </a>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <p className="mt-4 text-xs text-text-muted-brand">
          {t("payoutDrill.notice")}
        </p>
      </div>
    </section>
  );
}
