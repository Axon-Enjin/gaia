"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type FormState = "idle" | "submitting" | "success" | "error";

type WaitlistErrorCode =
  | "invalid_email"
  | "already_registered"
  | "service_unavailable"
  | "insert_failed"
  | "network";

const API_ERROR_CODES = new Set<string>([
  "invalid_email",
  "already_registered",
  "service_unavailable",
  "insert_failed",
]);

export function WaitlistForm() {
  const t = useTranslations("Landing");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorCode, setErrorCode] = useState<WaitlistErrorCode | null>(null);
  const [alreadyOnList, setAlreadyOnList] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "submitting") return;

    setState("submitting");
    setErrorCode(null);
    setAlreadyOnList(false);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          locale,
          source: "landing",
        }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (res.ok) {
        setState("success");
        setEmail("");
        return;
      }

      if (res.status === 409 && data.error === "already_registered") {
        setState("success");
        setAlreadyOnList(true);
        return;
      }

      const code = data.error;
      setErrorCode(
        code && API_ERROR_CODES.has(code)
          ? (code as WaitlistErrorCode)
          : res.status === 400
            ? "invalid_email"
            : "insert_failed",
      );
      setState("error");
    } catch {
      setErrorCode("network");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <p
        className="rounded-lg border border-growth-brand/30 bg-growth-brand/10 px-4 py-3 text-growth-brand"
        role="status"
      >
        {alreadyOnList ? t("waitlistAlready") : t("waitlistSuccess")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label htmlFor="waitlist-email" className="sr-only">
        {t("waitlistEmail")}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="waitlist-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("waitlistEmail")}
          disabled={state === "submitting"}
          className="min-h-11 flex-1 rounded-lg border border-border-brand bg-surface-brand px-4 text-text-brand placeholder:text-text-muted-brand focus:border-primary-brand focus:outline-none focus:ring-2 focus:ring-primary-brand/30 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={state === "submitting"}
          className="min-h-11 shrink-0 rounded-lg bg-primary-brand px-6 font-medium text-white hover:bg-primary-hover-brand disabled:opacity-60"
        >
          {state === "submitting" ? t("waitlistSubmitting") : t("waitlistSubmit")}
        </button>
      </div>
      <p className="text-sm text-text-muted-brand">{t("waitlistConsent")}</p>
      {state === "error" && errorCode && (
        <p className="text-sm text-error-brand" role="alert">
          {t(`waitlistError.${errorCode}`)}
        </p>
      )}
    </form>
  );
}
