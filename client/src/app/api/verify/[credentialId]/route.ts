import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  loadCredentialForVerify,
  verifyCredentialRecord,
} from "@/lib/credentials/verify-credential";

/** GET /api/verify/[credentialId] — PRD-F5 public verifier */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ credentialId: string }> },
) {
  const { credentialId } = await ctx.params;
  const idParsed = z.string().uuid().safeParse(credentialId);
  if (!idParsed.success) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  const supabase = await createClient();
  const row = await loadCredentialForVerify(supabase, idParsed.data);
  if (!row) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  const result = await verifyCredentialRecord(row);
  return Response.json(result);
}
