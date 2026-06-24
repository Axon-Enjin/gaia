import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/auth";
import {
  buildIssueResponseForExisting,
  IssueCredentialError,
  issueCredentialForEnrollment,
} from "@/lib/credentials/issue-credential";
import { createAdminClient } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env";

const BodySchema = z.object({
  enrollment_id: z.string().uuid(),
});

/** POST /api/credentials/issue — PRD-F4 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const profile = await ensureProfile();
  if (!profile || profile.role !== "learner") {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const result = await issueCredentialForEnrollment(
      supabase,
      parsed.data.enrollment_id,
      user.id,
    );
    return Response.json(result);
  } catch (e) {
    if (e instanceof IssueCredentialError) {
      if (e.code === "already_issued" && e.existingCredentialId) {
        const serviceKey = serverEnv.supabaseServiceRoleKey;
        if (serviceKey) {
          const admin = createAdminClient(serviceKey);
          const { data: existing } = await admin
            .from("credentials")
            .select("network, stellar_tx_hash")
            .eq("id", e.existingCredentialId)
            .maybeSingle();
          if (existing) {
            const payload = await buildIssueResponseForExisting(
              e.existingCredentialId,
              existing.network as "testnet" | "mainnet" | "mock",
              (existing.stellar_tx_hash as string | null) ?? null,
            );
            return Response.json(
              { ...payload, error: "already_issued" },
              { status: 409 },
            );
          }
        }
        return Response.json(
          { error: "already_issued", credential_id: e.existingCredentialId },
          { status: 409 },
        );
      }

      const status =
        e.code === "not_found"
          ? 404
          : e.code === "forbidden" ||
              e.code === "not_completed" ||
              e.code === "below_passing"
            ? 403
            : e.code === "anchor_failed"
              ? 502
              : 500;
      return Response.json({ error: e.code, message: e.message }, { status });
    }
    console.error("[credentials/issue]", e);
    return Response.json({ error: "internal_error" }, { status: 500 });
  }
}
