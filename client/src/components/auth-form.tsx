"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { signInAction, signUpAction, type AuthState } from "@/app/actions/auth";

const initial: AuthState = {};

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const t = useTranslations("Auth");
  const action = mode === "sign-in" ? signInAction : signUpAction;
  const [state, formAction, pending] = useActionState(action, initial);

  const errorKey = state.error;
  // `confirm_email` is informational (success), not a failure.
  const isInfo = errorKey === "confirm_email";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          {t("email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          {t("password")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          className="rounded border border-gray-300 px-3 py-2"
        />
      </div>

      {mode === "sign-up" ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="role" className="text-sm font-medium">
            {t("roleLabel")}
          </label>
          <select
            id="role"
            name="role"
            defaultValue="learner"
            className="rounded border border-gray-300 px-3 py-2"
          >
            <option value="learner">{t("roleLearner")}</option>
            <option value="teacher">{t("roleTeacher")}</option>
          </select>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-gray-900 px-5 py-2.5 text-white hover:bg-gray-800 disabled:opacity-60"
      >
        {mode === "sign-in" ? t("signIn") : t("signUp")}
      </button>

      {errorKey ? (
        <p
          role={isInfo ? "status" : "alert"}
          className={isInfo ? "text-sm text-green-700" : "text-sm text-red-700"}
        >
          {t(`error.${errorKey}`)}
        </p>
      ) : null}
    </form>
  );
}
