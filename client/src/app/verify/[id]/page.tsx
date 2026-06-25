import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import {
  loadCredentialForVerify,
  verifyCredentialRecord,
} from "@/lib/credentials/verify-credential";
import { LandingNav } from "@/components/landing/landing-nav";
import { stellarExplorerTxUrl } from "@/lib/credentials/stellar-explorer";
import { formatLocaleDate } from "@/lib/i18n/format";
import { CredentialCard } from "@/components/credential-card";
import { IconShieldCheck, IconCheck, IconArrowRight } from "@/components/icons";

function CheckRow({
  label,
  pass,
  passLabel,
  failLabel,
  naLabel,
}: {
  label: string;
  pass: boolean | null | undefined;
  passLabel: string;
  failLabel: string;
  naLabel?: string;
}) {
  const state = pass === true ? "pass" : pass === false ? "fail" : "na";
  const text =
    state === "pass" ? passLabel : state === "fail" ? failLabel : naLabel ?? "—";
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-text-muted-brand">{label}</dt>
      <dd
        className={`inline-flex items-center gap-1 font-semibold ${
          state === "pass"
            ? "text-growth-strong-brand"
            : state === "fail"
              ? "text-error-brand"
              : "text-text-muted-brand"
        }`}
      >
        {state === "pass" && <IconCheck aria-hidden="true" />}
        {text}
      </dd>
    </div>
  );
}

export default async function VerifyCredentialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("Verifier");
  const locale = await getLocale();
  const supabase = await createClient();
  const row = await loadCredentialForVerify(supabase, id);

  if (!row) {
    notFound();
  }

  const result = await verifyCredentialRecord(row);
  const stellarUrl = stellarExplorerTxUrl(result.network, result.stellar_tx_hash);

  return (
    <div className="product-page min-h-screen">
      <LandingNav signedIn={false} dashboardHref={null} />
      <main id="main-content" className="site-container py-10 sm:py-14">
        <div className="mx-auto max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-wider text-growth-strong-brand">
            {t("eyebrow")}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-soil-brand sm:text-3xl">
            {t("title")}
          </h1>

          {/* Verdict banner */}
          <div
            className={`mt-6 flex items-center gap-3 rounded-[var(--radius-surface)] border px-4 py-3 ${
              result.valid
                ? "border-growth-brand/40 bg-growth-brand/10"
                : "border-error-brand/40 bg-error-brand/5"
            }`}
            role="status"
          >
            <span
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-lg ${
                result.valid
                  ? "bg-growth-brand/20 text-growth-strong-brand"
                  : "bg-error-brand/15 text-error-brand"
              }`}
              aria-hidden
            >
              {result.valid ? <IconShieldCheck /> : "!"}
            </span>
            <p
              className={`text-lg font-bold ${
                result.valid ? "text-growth-strong-brand" : "text-error-brand"
              }`}
            >
              {result.valid ? t("valid") : t("invalid")}
            </p>
          </div>

          {/* The credential itself */}
          <div className="mt-6">
            <CredentialCard
              eyebrow={t("eyebrow")}
              learnerName={result.learner}
              courseTitle={result.course}
              metaLine={`${t("issued")}: ${formatLocaleDate(locale, result.issued_at)}${
                result.score !== null
                  ? ` · ${t("score")}: ${result.score}%`
                  : ""
              }`}
              mock={result.mock_anchor}
              mockLabel={t("mockNote")}
            />
          </div>

          {/* Verification checks */}
          <dl className="mt-6 flex flex-col gap-2 rounded-[var(--radius-surface)] border border-border-brand bg-surface-brand p-4 text-sm">
            <CheckRow
              label={t("signatureCheck")}
              pass={result.checks.signature}
              passLabel={t("pass")}
              failLabel={t("fail")}
              naLabel={t("na")}
            />
            {!result.mock_anchor && (
              <CheckRow
                label={t("chainCheck")}
                pass={result.checks.hash_on_chain}
                passLabel={t("pass")}
                failLabel={t("fail")}
                naLabel={t("na")}
              />
            )}
            {result.stellar_tx_hash && (
              <div className="mt-1 border-t border-border-brand pt-3">
                <dt className="text-text-muted-brand">{t("stellarTx")}</dt>
                <dd className="mt-1 break-all font-mono text-xs text-text-brand">
                  {result.stellar_tx_hash}
                </dd>
                {stellarUrl && (
                  <dd className="mt-2">
                    <a
                      href={stellarUrl}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-primary-brand hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("viewOnStellar")}
                      <IconArrowRight aria-hidden="true" />
                    </a>
                  </dd>
                )}
              </div>
            )}
          </dl>

          <p className="mt-8 text-center">
            <Link href="/courses" className="btn btn-secondary btn-sm">
              {t("browseCourses")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
