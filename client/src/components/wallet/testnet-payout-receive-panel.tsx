"use client";

import { useEffect, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  connectFreighter,
  isTestnetWalletState,
  readFreighterState,
  type WalletConnectionState,
} from "@/lib/wallet/freighter";
import { formatLocaleDate } from "@/lib/i18n/format";
import { IconCheck, IconRefresh, IconShieldCheck } from "@/components/icons";

interface TestnetPayoutReceivePanelProps {
  savedAddress: string | null;
  verifiedAt: string | null;
}

export function TestnetPayoutReceivePanel({
  savedAddress,
  verifiedAt,
}: TestnetPayoutReceivePanelProps) {
  const t = useTranslations("Wallet");
  const locale = useLocale();
  const [state, setState] = useState<WalletConnectionState>({ status: "checking" });
  const [pending, startTransition] = useTransition();
  const [savePending, setSavePending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(savedAddress);
  const [savedAt, setSavedAt] = useState(verifiedAt);

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

  async function saveAddress() {
    if (!isTestnetWalletState(state)) {
      setError(t("payout.errors.invalid_network"));
      return;
    }

    setSavePending(true);
    setError(null);

    try {
      const res = await fetch("/api/profile/payout-testnet-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: state.address,
          networkPassphrase: state.networkPassphrase,
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        payout_testnet_address?: string;
        payout_testnet_verified_at?: string;
      };

      if (!res.ok || !data.payout_testnet_address) {
        setError(
          data.error ? t(`payout.errors.${data.error}`) : t("payout.errors.save_failed"),
        );
        return;
      }

      setSaved(data.payout_testnet_address);
      setSavedAt(data.payout_testnet_verified_at ?? null);
    } catch {
      setError(t("payout.errors.save_failed"));
    } finally {
      setSavePending(false);
    }
  }

  const mismatch =
    state.status === "connected" &&
    saved &&
    state.address.trim() !== saved.trim();

  return (
    <section className="mt-6 rounded-[var(--radius-surface)] border border-border-brand bg-surface-brand p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-soil-brand">{t("payout.title")}</p>
          <p className="mt-1 text-sm text-text-muted-brand">{t("payout.subtitle")}</p>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-brand/10 text-primary-brand">
          <IconShieldCheck aria-hidden="true" />
        </span>
      </div>

      <div className="mt-4 rounded-[var(--radius-control)] border border-border-brand bg-bg-brand/55 p-4">
        {saved ? (
          <div className="rounded-[var(--radius-control)] border border-growth-brand/25 bg-growth-brand/8 p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-growth-strong-brand">
              <IconCheck aria-hidden="true" />
              {t("payout.saved")}
            </div>
            <p className="mt-2 font-mono text-sm text-text-brand break-all">{saved}</p>
            {savedAt && (
              <p className="mt-1 text-xs text-text-muted-brand">
                {t("payout.savedOn", {
                  date: formatLocaleDate(locale, savedAt),
                })}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-text-muted-brand">{t("payout.notSaved")}</p>
        )}

        {state.status === "checking" && (
          <p className="mt-4 text-sm text-text-muted-brand">{t("checking")}</p>
        )}

        {state.status === "not_installed" && (
          <p className="mt-4 text-sm text-text-muted-brand">{t("payout.installHint")}</p>
        )}

        {state.status === "disconnected" && (
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={handleConnect} className="btn btn-primary btn-sm">
              {t("connect")}
            </button>
          </div>
        )}

        {state.status === "connecting" && (
          <p className="mt-4 text-sm text-text-muted-brand">{t("connecting")}</p>
        )}

        {state.status === "connected" && (
          <div className="mt-4 space-y-3">
            <div className="rounded-[var(--radius-control)] border border-border-brand bg-white/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted-brand">
                {t("payout.connectedTitle")}
              </p>
              <p className="mt-2 font-mono text-sm text-text-brand break-all">
                {state.address}
              </p>
              <p className="mt-1 text-sm text-text-muted-brand">
                {t("networkValue", {
                  network: state.network,
                  shortAddress: state.shortAddress,
                })}
              </p>
            </div>

            {!isTestnetWalletState(state) && (
              <p className="text-sm text-warning-strong-brand">{t("payout.testnetOnly")}</p>
            )}

            {mismatch && (
              <p className="text-sm text-warning-strong-brand">{t("payout.mismatch")}</p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void saveAddress()}
                disabled={savePending || !isTestnetWalletState(state)}
                className="btn btn-primary btn-sm"
              >
                {savePending ? t("payout.saving") : t("payout.save")}
              </button>
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
          </div>
        )}

        {state.status === "error" && (
          <p className="mt-4 text-sm text-error-brand">{t(`errors.${state.code}`)}</p>
        )}

        {error && (
          <p className="mt-4 text-sm text-error-brand" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
