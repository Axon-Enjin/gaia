import type { SupabaseClient } from "@supabase/supabase-js";
import type { GrantCriteria } from "@/lib/grants/criteria-schema";
import { GrantCriteriaSchema } from "@/lib/grants/criteria-schema";
import { evaluateGrantCriteria } from "@/lib/grants/evaluate";

export interface GrantProgramRow {
  id: string;
  funder_id: string;
  name: string;
  criteria: GrantCriteria;
  amount_per_learner: number | null;
  simulated: boolean;
  created_at: string;
}

export async function listFunderPrograms(
  supabase: SupabaseClient,
  funderId: string,
): Promise<GrantProgramRow[]> {
  const { data, error } = await supabase
    .from("grant_programs")
    .select("id, funder_id, name, criteria, amount_per_learner, simulated, created_at")
    .eq("funder_id", funderId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(parseProgramRow);
}

export async function getFunderProgram(
  supabase: SupabaseClient,
  funderId: string,
  programId: string,
): Promise<GrantProgramRow | null> {
  const { data, error } = await supabase
    .from("grant_programs")
    .select("id, funder_id, name, criteria, amount_per_learner, simulated, created_at")
    .eq("id", programId)
    .eq("funder_id", funderId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return parseProgramRow(data);
}

function parseProgramRow(row: Record<string, unknown>): GrantProgramRow {
  const parsed = GrantCriteriaSchema.safeParse(row.criteria);
  if (!parsed.success) {
    throw new Error("invalid_program_criteria");
  }
  return {
    id: row.id as string,
    funder_id: row.funder_id as string,
    name: row.name as string,
    criteria: parsed.data,
    amount_per_learner:
      row.amount_per_learner !== null && row.amount_per_learner !== undefined
        ? Number(row.amount_per_learner)
        : null,
    simulated: row.simulated as boolean,
    created_at: row.created_at as string,
  };
}

export interface DisbursementAudit {
  disbursement_id: string;
  program_id: string;
  program_name: string;
  criteria_hash: string;
  criteria_snapshot: GrantCriteria;
  recipient_count: number;
  amount_per_learner: number | null;
  total_simulated_amount: number | null;
  simulated: true;
  created_at: string;
  recipients: Array<{
    learner_id: string;
    display_name: string | null;
    total_xp: number;
    badge_types: string[];
    matched_industry: string;
  }>;
}

/** Re-evaluate and persist a simulated disbursement audit record. */
export async function simulateDisbursement(
  supabase: SupabaseClient,
  funderId: string,
  programId: string,
): Promise<DisbursementAudit> {
  const program = await getFunderProgram(supabase, funderId, programId);
  if (!program) throw new Error("program_not_found");

  const evaluation = await evaluateGrantCriteria(program.criteria);
  const amount = program.amount_per_learner;
  const total =
    amount !== null ? amount * evaluation.match_count : null;

  const { data, error } = await supabase
    .from("grant_disbursements")
    .insert({
      program_id: program.id,
      funder_id: funderId,
      criteria_snapshot: program.criteria,
      criteria_hash: evaluation.criteria_hash,
      recipients: evaluation.recipients,
      recipient_count: evaluation.match_count,
      amount_per_learner: amount,
      total_simulated_amount: total,
      simulated: true,
    })
    .select("id, created_at")
    .single();

  if (error || !data) throw new Error(error?.message ?? "disburse_failed");

  return {
    disbursement_id: data.id as string,
    program_id: program.id,
    program_name: program.name,
    criteria_hash: evaluation.criteria_hash,
    criteria_snapshot: program.criteria,
    recipient_count: evaluation.match_count,
    amount_per_learner: amount,
    total_simulated_amount: total,
    simulated: true,
    created_at: data.created_at as string,
    recipients: evaluation.recipients,
  };
}

export async function getLatestDisbursement(
  supabase: SupabaseClient,
  funderId: string,
  programId: string,
): Promise<{ id: string; created_at: string; recipient_count: number } | null> {
  const { data, error } = await supabase
    .from("grant_disbursements")
    .select("id, created_at, recipient_count")
    .eq("funder_id", funderId)
    .eq("program_id", programId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    id: data.id as string,
    created_at: data.created_at as string,
    recipient_count: data.recipient_count as number,
  };
}
