"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { signInAction, signUpAction, type AuthState } from "@/app/actions/auth";

const initial: AuthState = {};

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const t = useTranslations("Auth");
  const tc = useTranslations("Common");
  const action = mode === "sign-in" ? signInAction : signUpAction;
  const [state, formAction, pending] = useActionState(action, initial);

  const errorKey = state.error;
  // `confirm_email` is informational (success), not a failure.
  const isInfo = errorKey === "confirm_email";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="field">
        <label htmlFor="email" className="field-label">
          {t("email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="field-input"
        />
      </div>

      <div className="field">
        <label htmlFor="password" className="field-label">
          {t("password")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          className="field-input"
        />
      </div>

      {mode === "sign-up" ? (
        <div className="field">
          <label htmlFor="role" className="field-label">
            {t("roleLabel")}
          </label>
          <select
            id="role"
            name="role"
            defaultValue="learner"
            className="field-select"
          >
            <option value="learner">{t("roleLearner")}</option>
            <option value="teacher">{t("roleTeacher")}</option>
            <option value="funder">{t("roleFunder")}</option>
          </select>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary btn-block mt-1"
      >
        {pending
          ? tc("loading")
          : mode === "sign-in"
            ? t("signIn")
            : t("signUp")}
      </button>

      {errorKey ? (
        <p
          role={isInfo ? "status" : "alert"}
          className={
            isInfo ? "inline-alert inline-alert--success" : "inline-alert inline-alert--error"
          }
        >
          {t(`error.${errorKey}`)}
        </p>
      ) : null}
    </form>
  );
}
