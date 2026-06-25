import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/auth";
import { simulateDisbursement } from "@/lib/grants/programs";

const BodySchema = z.object({
  program_id: z.string().uuid(),
});

/** POST /api/grants/disburse — PRD-F10 simulated disbursement */
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
  if (!profile || profile.role !== "funder") {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const audit = await simulateDisbursement(
      supabase,
      user.id,
      parsed.data.program_id,
    );
    return Response.json({
      disbursement_id: audit.disbursement_id,
      simulated: true,
      recipient_count: audit.recipient_count,
      total_simulated_amount: audit.total_simulated_amount,
      audit,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "program_not_found") {
      return Response.json({ error: "not_found" }, { status: 404 });
    }
    return Response.json({ error: "disburse_failed" }, { status: 500 });
  }
}
