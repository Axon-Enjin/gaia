"use client";

import { useState } from "react";

export interface CopyVerifyLinkProps {
  verifyUrl: string;
  copyLabel: string;
  copiedLabel: string;
}

export function CopyVerifyLink({
  verifyUrl,
  copyLabel,
  copiedLabel,
}: CopyVerifyLinkProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="btn btn-secondary btn-sm mt-3"
    >
      {copied ? copiedLabel : copyLabel}
    </button>
  );
}
