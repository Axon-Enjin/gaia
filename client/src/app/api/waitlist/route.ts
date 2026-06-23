import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env";

const WaitlistSchema = z.object({
  email: z.string().email().max(320),
  locale: z.enum(["en", "fil"]).optional().default("en"),
  source: z.string().max(120).optional().default("landing"),
});

/**
 * POST /api/waitlist  (PRD-F8, SDD §4)
 *
 * Public waitlist capture — inserts via service role only.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const parsed = WaitlistSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid_email" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const { locale, source } = parsed.data;

  let serviceRoleKey: string;
  try {
    serviceRoleKey = serverEnv.supabaseServiceRoleKeyRequired;
  } catch {
    return Response.json({ error: "service_unavailable" }, { status: 503 });
  }

  const admin = createAdminClient(serviceRoleKey);
  const { error } = await admin.from("waitlist").insert({
    email,
    locale,
    source,
  });

  if (error) {
    if (error.code === "23505") {
      return Response.json({ error: "already_registered" }, { status: 409 });
    }
    console.error("[waitlist] insert failed:", error.message);
    return Response.json({ error: "insert_failed" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
