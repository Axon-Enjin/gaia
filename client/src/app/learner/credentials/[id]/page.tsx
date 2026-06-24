import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { getLearnerCredentialById } from "@/lib/credentials/list";
import { verifyUrlFor } from "@/lib/credentials/issuer-config";
import { stellarExplorerTxUrl } from "@/lib/credentials/stellar-explorer";
import { CopyVerifyLink } from "@/components/learner/copy-verify-link";

export default async function LearnerCredentialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return null;

  const tc = await getTranslations("Credentials");
  const supabase = await createClient();
  const cred = await getLearnerCredentialById(supabase, user.id, id);

  if (!cred) {
    notFound();
  }

  const verifyUrl = verifyUrlFor(cred.id);
  const stellarUrl = stellarExplorerTxUrl(cred.network, cred.stellar_tx_hash);
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 240,
  });

  return (
    <div>
      <Link
        href="/learner/credentials"
        className="text-sm font-medium text-primary-brand hover:underline"
      >
        ← {tc("backToWallet")}
      </Link>

      <div className="mt-6 rounded-2xl border border-border-brand bg-surface-brand p-6">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="industry-pill">{cred.course_industry}</span>
          {cred.network === "mock" && (
            <span className="text-xs text-text-muted-brand">{tc("mockBadge")}</span>
          )}
        </div>
        <h1 className="text-xl font-bold text-soil-brand">{cred.course_title}</h1>
        <p className="mt-2 text-sm text-text-muted-brand">
          {tc("issuedOn", {
            date: new Date(cred.issued_at).toLocaleDateString(),
          })}
          {cred.final_score !== null &&
            ` · ${tc("score", { score: cred.final_score })}`}
        </p>

        <div className="mt-6 rounded-xl border border-border-brand bg-bg-brand/50 p-4">
          <p className="text-sm font-medium text-text-brand">{tc("shareLink")}</p>
          <a
            href={verifyUrl}
            className="mt-2 block break-all text-sm font-semibold text-primary-brand underline hover:no-underline"
          >
            {verifyUrl}
          </a>
          <CopyVerifyLink
            verifyUrl={verifyUrl}
            copyLabel={tc("copyLink")}
            copiedLabel={tc("copied")}
          />
        </div>

        <div className="mt-6 flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt=""
            className="h-48 w-48 rounded-lg border border-border-brand bg-white p-2"
          />
          <p className="mt-2 text-xs text-text-muted-brand">{tc("qrHint")}</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={verifyUrl}
            className="site-btn-primary inline-flex"
            target="_blank"
            rel="noopener noreferrer"
          >
            {tc("openVerifier")}
          </Link>
          {stellarUrl && (
            <a
              href={stellarUrl}
              className="site-btn inline-flex border border-border-brand bg-surface-brand text-text-brand hover:bg-bg-brand/80"
              target="_blank"
              rel="noopener noreferrer"
            >
              {tc("viewOnStellar")}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
