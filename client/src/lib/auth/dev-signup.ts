import { createAdminClient } from "@/lib/supabase/admin";

type DevRole = "learner" | "teacher" | "funder";

/**
 * Create a user via the Admin API with email pre-confirmed.
 * Sends no confirmation email — avoids Supabase built-in mailer rate limits in dev.
 */
export async function createUserWithoutEmail(
  serviceRoleKey: string,
  input: { email: string; password: string; role: DevRole },
): Promise<{ ok: true } | { ok: false; reason: "already_registered" | "failed" }> {
  const admin = createAdminClient(serviceRoleKey);
  const { error } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { role: input.role },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes("already registered") ||
      msg.includes("already been registered") ||
      error.code === "email_exists"
    ) {
      return { ok: false, reason: "already_registered" };
    }
    return { ok: false, reason: "failed" };
  }

  return { ok: true };
}

/** True when local dev should prefer Admin API signup (no outbound auth emails). */
export function shouldUseDevAdminSignup(serviceRoleKey: string | undefined): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  if (process.env.SUPABASE_DEV_ADMIN_SIGNUP === "false") return false;
  return Boolean(serviceRoleKey);
}
