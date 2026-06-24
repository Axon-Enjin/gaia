import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import {
  loadCredentialForVerify,
  verifyCredentialRecord,
} from "@/lib/credentials/verify-credential";
import { LandingNav } from "@/components/landing/landing-nav";
import { stellarExplorerTxUrl } from "@/lib/credentials/stellar-explorer";

export default async function VerifyCredentialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("Verifier");
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
      <main className="site-container py-10 sm:py-14">
        <div className="mx-auto max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-wider text-growth-brand">
            {t("eyebrow")}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-soil-brand sm:text-3xl">
            {t("title")}
          </h1>

          <div
            className={`mt-8 rounded-2xl border px-6 py-8 ${
              result.valid
                ? "border-growth-brand/40 bg-growth-brand/10"
                : "border-error-brand/40 bg-error-brand/5"
            }`}
            role="status"
          >
            <p
              className={`text-lg font-bold ${
                result.valid ? "text-growth-brand" : "text-error-brand"
              }`}
            >
              {result.valid ? t("valid") : t("invalid")}
            </p>

            {result.mock_anchor && (
              <p className="mt-2 text-sm text-text-muted-brand">{t("mockNote")}</p>
            )}

            <dl className="mt-6 flex flex-col gap-3 text-sm">
              <div>
                <dt className="text-text-muted-brand">{t("course")}</dt>
                <dd className="font-medium text-text-brand">{result.course}</dd>
              </div>
              <div>
                <dt className="text-text-muted-brand">{t("learner")}</dt>
                <dd className="font-medium text-text-brand">{result.learner}</dd>
              </div>
              <div>
                <dt className="text-text-muted-brand">{t("issued")}</dt>
                <dd className="font-medium text-text-brand">
                  {new Date(result.issued_at).toLocaleDateString()}
                </dd>
              </div>
              {result.score !== null && (
                <div>
                  <dt className="text-text-muted-brand">{t("score")}</dt>
                  <dd className="font-medium text-text-brand">{result.score}%</dd>
                </div>
              )}
              <div>
                <dt className="text-text-muted-brand">{t("signatureCheck")}</dt>
                <dd className="font-medium text-text-brand">
                  {result.checks.signature ? t("pass") : t("fail")}
                </dd>
              </div>
              {!result.mock_anchor && (
                <div>
                  <dt className="text-text-muted-brand">{t("chainCheck")}</dt>
                  <dd className="font-medium text-text-brand">
                    {result.checks.hash_on_chain === true
                      ? t("pass")
                      : result.checks.hash_on_chain === false
                        ? t("fail")
                        : t("na")}
                  </dd>
                </div>
              )}
              {result.stellar_tx_hash && (
                <div>
                  <dt className="text-text-muted-brand">{t("stellarTx")}</dt>
                  <dd className="break-all font-mono text-xs text-text-brand">
                    {result.stellar_tx_hash}
                  </dd>
                  {stellarUrl && (
                    <dd className="mt-2">
                      <a
                        href={stellarUrl}
                        className="text-sm font-semibold text-primary-brand underline hover:no-underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t("viewOnStellar")}
                      </a>
                    </dd>
                  )}
                </div>
              )}
            </dl>
          </div>

          <p className="mt-8 text-center text-sm text-text-muted-brand">
            <Link href="/courses" className="font-semibold text-primary-brand underline">
              {t("browseCourses")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
