import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/auth";
import { isTestnetPassphrase } from "@/lib/wallet/freighter";
import { validatePublicAddress } from "@/lib/grants/payout-drill";

const BodySchema = z.object({
  address: z.string().min(1),
  networkPassphrase: z.string().min(1),
});

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

  if (!isTestnetPassphrase(parsed.data.networkPassphrase)) {
    return Response.json({ error: "invalid_network" }, { status: 400 });
  }

  let address: string;
  try {
    address = validatePublicAddress(parsed.data.address);
  } catch {
    return Response.json({ error: "invalid_address" }, { status: 400 });
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

  const verifiedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      payout_testnet_address: address,
      payout_testnet_verified_at: verifiedAt,
    })
    .eq("id", user.id)
    .select("payout_testnet_address, payout_testnet_verified_at")
    .single();

  if (error || !data) {
    return Response.json({ error: "save_failed" }, { status: 500 });
  }

  return Response.json({
    payout_testnet_address: data.payout_testnet_address,
    payout_testnet_verified_at: data.payout_testnet_verified_at,
  });
}
