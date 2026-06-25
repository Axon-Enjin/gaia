"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  connectFreighter,
  readFreighterState,
  type WalletConnectionState,
} from "@/lib/wallet/freighter";
import { IconArrowRight, IconRefresh, IconShieldCheck } from "@/components/icons";

const FREIGHTER_SITE = "https://www.freighter.app/";

export function FreighterConnectPanel({
  surface,
  className = "",
}: {
  surface: "learner" | "funder";
  className?: string;
}) {
  const t = useTranslations("Wallet");
  const [state, setState] = useState<WalletConnectionState>({ status: "checking" });
  const [pending, startTransition] = useTransition();

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
    startTransition(() => {
      void readFreighterState().then(setState);
    });
  }

  function handleConnect() {
    setState({ status: "connecting" });
    startTransition(() => {
      void connectFreighter().then(setState);
    });
  }

  const title =
    surface === "learner" ? t("learnerTitle") : t("funderTitle");
  const subtitle =
    surface === "learner" ? t("learnerSubtitle") : t("funderSubtitle");

  return (
    <section
      className={`rounded-[var(--radius-surface)] border border-border-brand bg-surface-brand p-4 sm:p-5 ${className}`.trim()}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-soil-brand">{title}</p>
          <p className="mt-1 text-sm text-text-muted-brand">{subtitle}</p>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-brand/10 text-primary-brand">
          <IconShieldCheck aria-hidden="true" />
        </span>
      </div>

      <div className="mt-4 rounded-[var(--radius-control)] border border-border-brand bg-bg-brand/55 p-4">
        {state.status === "checking" && (
          <p className="text-sm text-text-muted-brand">{t("checking")}</p>
        )}

        {state.status === "not_installed" && (
          <>
            <p className="text-sm font-medium text-text-brand">{t("notInstalledTitle")}</p>
            <p className="mt-1 text-sm text-text-muted-brand">{t("notInstalledBody")}</p>
            <a
              href={FREIGHTER_SITE}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm mt-4"
            >
              {t("install")}
            </a>
          </>
        )}

        {state.status === "disconnected" && (
          <>
            <p className="text-sm font-medium text-text-brand">{t("disconnectedTitle")}</p>
            <p className="mt-1 text-sm text-text-muted-brand">{t("disconnectedBody")}</p>
            <button
              type="button"
              onClick={handleConnect}
              disabled={pending}
              className="btn btn-primary btn-sm mt-4"
            >
              {pending ? t("connecting") : t("connect")}
            </button>
          </>
        )}

        {state.status === "connecting" && (
          <p className="text-sm text-text-muted-brand">{t("connecting")}</p>
        )}

        {state.status === "connected" && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-growth-brand/12 px-2.5 py-1 text-xs font-semibold text-growth-strong-brand">
                {t("connected")}
              </span>
              <span className="rounded-full bg-primary-brand/10 px-2.5 py-1 text-xs font-semibold text-primary-brand">
                {state.network}
              </span>
            </div>

            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-text-muted-brand">{t("addressLabel")}</dt>
                <dd className="mt-1 font-mono text-text-brand">{state.address}</dd>
              </div>
              <div>
                <dt className="text-text-muted-brand">{t("networkLabel")}</dt>
                <dd className="mt-1 text-text-brand">
                  {t("networkValue", { network: state.network, shortAddress: state.shortAddress })}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={refreshState}
              disabled={pending}
              className="btn btn-ghost border border-border-brand btn-sm mt-4"
            >
              <IconRefresh aria-hidden="true" />
              {t("refresh")}
            </button>
          </>
        )}

        {state.status === "error" && (
          <>
            <p className="text-sm font-medium text-error-brand">{t("errorTitle")}</p>
            <p className="mt-1 text-sm text-text-muted-brand">{t(`errors.${state.code}`)}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={refreshState}
                disabled={pending}
                className="btn btn-secondary btn-sm"
              >
                <IconRefresh aria-hidden="true" />
                {t("refresh")}
              </button>
              <a
                href={FREIGHTER_SITE}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary-brand hover:underline"
              >
                {t("installHint")} <IconArrowRight aria-hidden="true" />
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
