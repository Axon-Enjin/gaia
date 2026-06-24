import type { ReactNode } from "react";
import { IconAward } from "@/components/icons";

interface CredentialCardProps {
  eyebrow: string;
  learnerName: string;
  courseTitle: string;
  industry?: string;
  metaLine?: string;
  mock?: boolean;
  mockLabel?: string;
  children?: ReactNode;
}

/**
 * The brand's signature object — a certificate with the learner's name as the
 * hero, a woven (banig) border, and the heaviest elevation in the system
 * (DSD §4 "certificate gravitas"). Used on the credential detail and the
 * public verifier.
 */
export function CredentialCard({
  eyebrow,
  learnerName,
  courseTitle,
  industry,
  metaLine,
  mock = false,
  mockLabel,
  children,
}: CredentialCardProps) {
  return (
    <article className="credential-card">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="credential-card-eyebrow">{eyebrow}</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-text-muted-brand">
            {/* "Issued to" implied — name is the hero */}
          </p>
          <h2 className="credential-card-name mt-1">{learnerName}</h2>
        </div>
        <span className="credential-card-seal flex-shrink-0 text-2xl" aria-hidden>
          <IconAward />
        </span>
      </div>

      <div className="mt-5 border-t border-border-brand pt-4">
        {industry && (
          <span className="industry-pill mb-2 inline-flex">{industry}</span>
        )}
        <p className="credential-card-course">{courseTitle}</p>
        {metaLine && (
          <p className="mt-1 text-sm text-text-muted-brand">{metaLine}</p>
        )}
        {mock && mockLabel && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-warning-brand/12 px-3 py-1 text-xs font-medium text-warning-brand">
            {mockLabel}
          </p>
        )}
      </div>

      {children && <div className="mt-5">{children}</div>}
    </article>
  );
}
