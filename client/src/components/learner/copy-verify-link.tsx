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
      className="mt-3 min-h-11 rounded-lg border border-border-brand bg-surface-brand px-4 text-sm font-medium text-text-brand hover:bg-bg-brand"
    >
      {copied ? copiedLabel : copyLabel}
    </button>
  );
}
