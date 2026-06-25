"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface ClaimCredentialButtonProps {
  enrollmentId: string;
  labels: {
    claim: string;
    claiming: string;
    viewCredential: string;
    mockBadge: string;
    errorGeneric: string;
    errorForbidden: string;
  };
  existingCredentialId?: string | null;
  verifyUrl?: string | null;
  qrDataUrl?: string | null;
  network?: string | null;
}

function qrSrc(dataUrl?: string, base64?: string): string | null {
  if (dataUrl) return dataUrl;
  if (base64) return `data:image/png;base64,${base64}`;
  return null;
}

function CredentialReadyPanel({
  url,
  qr,
  network,
  labels,
}: {
  url: string;
  qr: string | null;
  network: string | null;
  labels: ClaimCredentialButtonProps["labels"];
}) {
  return (
    <div className="credential-claim-panel rounded-[var(--radius-surface)] border border-growth-brand/30 bg-growth-brand/5 p-4">
      <p className="text-sm font-semibold text-growth-strong-brand">
        {labels.viewCredential}
      </p>
      {network === "mock" && (
        <p className="mt-1 text-xs text-text-muted-brand">{labels.mockBadge}</p>
      )}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 block break-all text-sm font-semibold text-primary-brand underline hover:no-underline"
      >
        {url}
      </a>
      {qr && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={qr}
          alt=""
          className="mt-4 h-40 w-40 rounded-[var(--radius-control)] border border-border-brand bg-white p-2"
        />
      )}
    </div>
  );
}

export function ClaimCredentialButton({
  enrollmentId,
  labels,
  existingCredentialId,
  verifyUrl: initialVerifyUrl,
  qrDataUrl: initialQrDataUrl,
  network: initialNetwork,
}: ClaimCredentialButtonProps) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [verifyUrl, setVerifyUrl] = useState(initialVerifyUrl ?? "");
  const [qrBase64, setQrBase64] = useState("");
  const [network, setNetwork] = useState<string | null>(initialNetwork ?? null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resolvedVerifyUrl = verifyUrl || initialVerifyUrl || null;

  if (existingCredentialId && resolvedVerifyUrl) {
    return (
      <CredentialReadyPanel
        url={resolvedVerifyUrl}
        qr={qrSrc(initialQrDataUrl ?? undefined, qrBase64 || undefined)}
        network={initialNetwork ?? network}
        labels={labels}
      />
    );
  }

  async function handleClaim() {
    if (state === "loading") return;
    setState("loading");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/credentials/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollment_id: enrollmentId }),
      });
      const data = (await res.json()) as {
        verify_url?: string;
        qr_png_base64?: string;
        network?: string;
        error?: string;
        message?: string;
      };

      if (res.status === 409 && data.verify_url) {
        setVerifyUrl(data.verify_url);
        setQrBase64(data.qr_png_base64 ?? "");
        setNetwork(data.network ?? null);
        setState("success");
        router.refresh();
        return;
      }

      if (!res.ok) {
        setErrorMsg(
          data.error === "forbidden" ||
            data.error === "not_completed" ||
            data.error === "below_passing"
            ? labels.errorForbidden
            : labels.errorGeneric,
        );
        setState("error");
        return;
      }

      setVerifyUrl(data.verify_url ?? "");
      setQrBase64(data.qr_png_base64 ?? "");
      setNetwork(data.network ?? null);
      setState("success");
      router.refresh();
    } catch {
      setErrorMsg(labels.errorGeneric);
      setState("error");
    }
  }

  if (state === "success" && verifyUrl) {
    return (
      <CredentialReadyPanel
        url={verifyUrl}
        qr={qrSrc(undefined, qrBase64)}
        network={network}
        labels={labels}
      />
    );
  }

  return (
    <div className="credential-claim-panel">
      <button
        type="button"
        onClick={handleClaim}
        disabled={state === "loading"}
        className="btn btn-growth w-full sm:w-auto"
      >
        {state === "loading" ? labels.claiming : labels.claim}
      </button>
      {state === "error" && errorMsg && (
        <p className="inline-alert inline-alert--error mt-2" role="alert">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
