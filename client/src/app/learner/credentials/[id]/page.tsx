import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser, getProfile } from "@/lib/auth";
import { getLearnerCredentialById } from "@/lib/credentials/list";
import { verifyUrlFor } from "@/lib/credentials/issuer-config";
import { stellarExplorerTxUrl } from "@/lib/credentials/stellar-explorer";
import { formatLocaleDate } from "@/lib/i18n/format";
import { CopyVerifyLink } from "@/components/learner/copy-verify-link";
import { CredentialCard } from "@/components/credential-card";
import { IconArrowRight, IconShieldCheck } from "@/components/icons";

export default async function LearnerCredentialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return null;

  const tc = await getTranslations("Credentials");
  const locale = await getLocale();
  const supabase = await createClient();
  const cred = await getLearnerCredentialById(supabase, user.id, id);

  if (!cred) {
    notFound();
  }

  const profile = await getProfile(supabase, user.id);
  const learnerName =
    profile?.display_name?.trim() || user.email?.split("@")[0] || tc("defaultLearner");

  const verifyUrl = verifyUrlFor(cred.id);
  const stellarUrl = stellarExplorerTxUrl(cred.network, cred.stellar_tx_hash);
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 240,
  });

  const metaLine = `${tc("issuedOn", {
    date: formatLocaleDate(locale, cred.issued_at),
  })}${cred.final_score !== null ? ` · ${tc("score", { score: cred.final_score })}` : ""}`;

  return (
    <div>
      <Link
        href="/learner/credentials"
        prefetch={false}
        className="inline-flex items-center gap-1 text-sm font-medium text-primary-brand hover:underline"
      >
        <IconArrowRight className="rotate-180" aria-hidden="true" />
        {tc("backToWallet")}
      </Link>

      <div className="mt-6">
        <CredentialCard
          eyebrow={tc("eyebrow")}
          learnerName={learnerName}
          courseTitle={cred.course_title}
          industry={cred.course_industry}
          metaLine={metaLine}
          mock={cred.network === "mock"}
          mockLabel={tc("mockBadge")}
        />
      </div>

      <div className="mt-6 rounded-[var(--radius-surface)] border border-border-brand bg-surface-brand p-5">
        <p className="text-sm font-semibold text-text-brand">
          {tc("shareLink")}
        </p>
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

        <div className="mt-6 flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt=""
            className="h-48 w-48 rounded-[var(--radius-control)] border border-border-brand bg-white p-2"
          />
          <p className="mt-2 text-xs text-text-muted-brand">{tc("qrHint")}</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={verifyUrl}
            className="btn btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconShieldCheck aria-hidden="true" />
            {tc("openVerifier")}
          </a>
          {stellarUrl && (
            <a
              href={stellarUrl}
              className="btn btn-secondary"
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
