import { z } from "zod";
import { ensureProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { flags, serverEnv } from "@/lib/env";
import {
  PayoutDrillError,
  submitPayoutDrill,
} from "@/lib/grants/payout-drill";

const BodySchema = z.object({
  drill_id: z.string().uuid(),
  signed_xdr: z.string().min(1),
  signer_address: z.string().min(1),
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
    const result = await submitPayoutDrill(admin, {
      funderId: user.id,
      drillId: parsed.data.drill_id,
      signedXdr: parsed.data.signed_xdr,
      signerAddress: parsed.data.signer_address,
    });
    return Response.json(result);
  } catch (error) {
    if (error instanceof PayoutDrillError) {
      const status =
        error.code === "drill_not_found"
          ? 404
          : error.code === "wallet_mismatch" ||
              error.code === "already_submitted"
            ? 409
            : error.code === "invalid_address" ||
                error.code === "invalid_transaction"
              ? 400
              : 502;

      return Response.json({ error: error.code }, { status });
    }

    return Response.json({ error: "submit_failed" }, { status: 500 });
  }
}
