import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/auth";
import { GrantCriteriaSchema } from "@/lib/grants/criteria-schema";
import { evaluateGrantCriteria } from "@/lib/grants/evaluate";
import { getFunderProgram } from "@/lib/grants/programs";

const BodySchema = z.union([
  z.object({ program_id: z.string().uuid() }),
  z.object({ criteria: GrantCriteriaSchema }),
]);

/** POST /api/grants/evaluate — PRD-F10 */
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

  let criteria;
  if ("program_id" in parsed.data) {
    const program = await getFunderProgram(
      supabase,
      user.id,
      parsed.data.program_id,
    );
    if (!program) {
      return Response.json({ error: "not_found" }, { status: 404 });
    }
    criteria = program.criteria;
  } else {
    criteria = parsed.data.criteria;
  }

  try {
    const result = await evaluateGrantCriteria(criteria);
    return Response.json(result);
  } catch {
    return Response.json({ error: "evaluate_failed" }, { status: 500 });
  }
}
