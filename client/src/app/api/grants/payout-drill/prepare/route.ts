import { z } from "zod";
import { ensureProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { flags, serverEnv } from "@/lib/env";
import {
  PayoutDrillError,
  preparePayoutDrill,
} from "@/lib/grants/payout-drill";

const BodySchema = z.object({
  program_id: z.string().uuid(),
  source_disbursement_id: z.string().uuid(),
  funder_address: z.string().min(1),
  demo_amount_xlm: z.string().min(1),
});

export async function POST(req: Request) {
  if (!flags.testnetPayoutDrill) {
    return Response.json({ error: "unavailable" }, { status: 404 });
  }
  if (!serverEnv.supabaseServiceRoleKey) {
    return Response.json({ error: "unavailable" }, { status: 503 });
  }

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

  const admin = createAdminClient(serverEnv.supabaseServiceRoleKey);

  try {
    const drill = await preparePayoutDrill(admin, {
      funderId: user.id,
      programId: parsed.data.program_id,
      sourceDisbursementId: parsed.data.source_disbursement_id,
      funderAddress: parsed.data.funder_address,
      demoAmountXlm: parsed.data.demo_amount_xlm,
    });
    return Response.json(drill);
  } catch (error) {
    if (error instanceof PayoutDrillError) {
      const status =
        error.code === "invalid_amount" ||
        error.code === "invalid_address"
          ? 400
          : error.code === "no_simulation"
            ? 404
            : error.code === "stale_simulation" ||
                error.code === "recipient_cap_exceeded" ||
                error.code === "no_recipients"
              ? 409
              : 500;

      return Response.json({ error: error.code }, { status });
    }

    return Response.json({ error: "prepare_failed" }, { status: 500 });
  }
}
