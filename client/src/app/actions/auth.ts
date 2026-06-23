"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/auth";

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

const SignUpSchema = CredentialsSchema.extend({
  role: z.enum(["learner", "teacher"]).default("learner"),
});

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
  redirect(profile?.role === "teacher" ? "/teacher" : "/courses");
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
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { role: parsed.data.role } },
  });
  if (error) return { error: "sign_up_failed" };

  // If email confirmation is disabled, a session exists now — provision profile
  // and route. Otherwise, ask the user to confirm their email.
  if (data.session) {
    await ensureProfile();
    redirect(parsed.data.role === "teacher" ? "/teacher" : "/courses");
  }
  return { error: "confirm_email" };
}

/** Sign out and return home. */
export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
