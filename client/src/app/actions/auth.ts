"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/auth";
import {
  createUserWithoutEmail,
  shouldUseDevAdminSignup,
} from "@/lib/auth/dev-signup";
import { serverEnv } from "@/lib/env";

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

const SignUpSchema = CredentialsSchema.extend({
  role: z.enum(["learner", "teacher", "funder"]).default("learner"),
});

function dashboardForRole(role: string): string {
  if (role === "teacher") return "/teacher";
  if (role === "funder") return "/funder";
  return "/learner";
}

export interface AuthState {
  error?: string;
}

/** Sign in with email/password, then route by role. */
export async function signInAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = CredentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "invalid_credentials" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "sign_in_failed" };

  const profile = await ensureProfile();
  redirect(dashboardForRole(profile?.role ?? "learner"));
}

/** Sign up with email/password + desired role; role is stored in metadata. */
export async function signUpAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = SignUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") ?? "learner",
  });
  if (!parsed.success) return { error: "invalid_signup" };

  const supabase = await createClient();
  const credentials = {
    email: parsed.data.email,
    password: parsed.data.password,
  };

  // Dev: Admin API signup never sends confirmation emails (avoids mailer rate limits).
  if (shouldUseDevAdminSignup(serverEnv.supabaseServiceRoleKey)) {
    const created = await createUserWithoutEmail(
      serverEnv.supabaseServiceRoleKey!,
      { ...credentials, role: parsed.data.role },
    );
    if (!created.ok) {
      return {
        error:
          created.reason === "already_registered"
            ? "already_registered"
            : "sign_up_failed",
      };
    }

    const { error: signInError } =
      await supabase.auth.signInWithPassword(credentials);
    if (signInError) return { error: "sign_up_failed" };

    await ensureProfile();
    redirect(dashboardForRole(parsed.data.role));
  }

  const { data, error } = await supabase.auth.signUp({
    ...credentials,
    options: { data: { role: parsed.data.role } },
  });
  if (error) {
    const code = error.message?.toLowerCase() ?? "";
    if (
      code.includes("rate limit") ||
      error.code === "over_email_send_rate_limit"
    ) {
      return { error: "email_rate_limit" };
    }
    if (
      code.includes("already registered") ||
      error.code === "user_already_exists"
    ) {
      return { error: "already_registered" };
    }
    return { error: "sign_up_failed" };
  }

  // mailer_autoconfirm on → session exists immediately; else confirm via email.
  if (data.session) {
    await ensureProfile();
    redirect(dashboardForRole(parsed.data.role));
  }
  return { error: "confirm_email" };
}

/** Sign out and return home. */
export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
