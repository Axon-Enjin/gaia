import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env";
import {
  filterEligibleRecipients,
  type LearnerMeritRow,
} from "@/lib/grants/evaluate";
import {
  GrantCriteriaSchema,
  type GrantCriteria,
} from "@/lib/grants/criteria-schema";

export interface LearnerGrantStatusCard {
  programId: string;
  programName: string;
  industry: string;
  minXp: number;
  requiredBadges: string[];
  requireCredential: boolean;
  amountPerLearner: number | null;
  eligibleNow: boolean;
  includedInLatestSimulation: boolean;
  latestSimulationAt: string | null;
}

export interface LearnerGrantStatusResult {
  available: boolean;
  cards: LearnerGrantStatusCard[];
  errorCode?: "service_unavailable" | "query_failed";
}

export interface LearnerGrantProgram {
  id: string;
  name: string;
  criteria: GrantCriteria;
  amountPerLearner: number | null;
}

export interface LatestGrantDisbursement {
  programId: string;
  createdAt: string;
  recipients: unknown;
}

interface GrantProgramDbRow {
  id: unknown;
  name: unknown;
  criteria: unknown;
  amount_per_learner: unknown;
}

interface GetLearnerGrantStatusOptions {
  serviceRoleKey?: string;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function parseIndustryJoin(
  raw: unknown,
): { industry: string } | null {
  if (!raw || typeof raw !== "object") return null;
  const row = Array.isArray(raw) ? raw[0] : raw;
  if (!row || typeof row !== "object") return null;
  const industry = (row as { industry?: unknown }).industry;
  if (typeof industry !== "string" || !industry.trim()) return null;
  return { industry };
}

function includesLearnerRecipient(recipients: unknown, learnerId: string): boolean {
  if (!Array.isArray(recipients)) return false;
  return recipients.some((entry) => {
    if (!entry || typeof entry !== "object") return false;
    return (entry as { learner_id?: unknown }).learner_id === learnerId;
  });
}

export function selectLatestDisbursements(
  rows: LatestGrantDisbursement[],
): Map<string, LatestGrantDisbursement> {
  const latest = new Map<string, LatestGrantDisbursement>();
  for (const row of rows) {
    const prev = latest.get(row.programId);
    if (!prev) {
      latest.set(row.programId, row);
      continue;
    }
    if (new Date(row.createdAt).getTime() > new Date(prev.createdAt).getTime()) {
      latest.set(row.programId, row);
    }
  }
  return latest;
}

export function buildLearnerGrantStatusCards(
  learnerId: string,
  programs: LearnerGrantProgram[],
  snapshot: LearnerMeritRow,
  latestByProgram: Map<string, LatestGrantDisbursement>,
): LearnerGrantStatusCard[] {
  const cards: LearnerGrantStatusCard[] = [];

  for (const program of programs) {
    const eligibleNow =
      filterEligibleRecipients([snapshot], program.criteria).length > 0;
    const latest = latestByProgram.get(program.id);
    const includedInLatestSimulation =
      latest ? includesLearnerRecipient(latest.recipients, learnerId) : false;

    if (!eligibleNow && !includedInLatestSimulation) {
      continue;
    }

    cards.push({
      programId: program.id,
      programName: program.name,
      industry: program.criteria.industry,
      minXp: program.criteria.min_xp,
      requiredBadges: [...(program.criteria.required_badges ?? [])],
      requireCredential: program.criteria.require_credential ?? false,
      amountPerLearner: program.amountPerLearner,
      eligibleNow,
      includedInLatestSimulation,
      latestSimulationAt: latest?.createdAt ?? null,
    });
  }

  return cards;
}

async function loadLearnerSnapshot(
  admin: SupabaseClient,
  learnerId: string,
): Promise<LearnerMeritRow> {
  const { data: ledgerRows } = await admin
    .from("merit_ledger")
    .select("xp_delta")
    .eq("learner_id", learnerId);

  const totalXp = (ledgerRows ?? []).reduce((sum, row) => {
    const delta = Number((row as { xp_delta?: unknown }).xp_delta ?? 0);
    return sum + (Number.isFinite(delta) ? delta : 0);
  }, 0);

  const { data: badgeRows } = await admin
    .from("badges")
    .select("badge_type")
    .eq("learner_id", learnerId);

  const badgeTypes = toStringArray(
    (badgeRows ?? []).map((row) => (row as { badge_type?: unknown }).badge_type),
  );

  const { data: enrollmentRows } = await admin
    .from("enrollments")
    .select("completed_at, courses(industry)")
    .eq("learner_id", learnerId);

  const completedIndustriesSet = new Set<string>();
  for (const row of enrollmentRows ?? []) {
    const completedAt = (row as { completed_at?: unknown }).completed_at;
    if (!completedAt) continue;
    const joined = parseIndustryJoin((row as { courses?: unknown }).courses);
    if (joined) completedIndustriesSet.add(joined.industry);
  }

  const { data: credentialRows } = await admin
    .from("credentials")
    .select("courses(industry)")
    .eq("learner_id", learnerId);

  const credentialIndustriesSet = new Set<string>();
  for (const row of credentialRows ?? []) {
    const joined = parseIndustryJoin((row as { courses?: unknown }).courses);
    if (joined) credentialIndustriesSet.add(joined.industry);
  }

  return {
    learner_id: learnerId,
    display_name: null,
    total_xp: totalXp,
    badge_types: badgeTypes,
    completed_industries: [...completedIndustriesSet],
    credential_industries: [...credentialIndustriesSet],
  };
}

async function loadPrograms(
  admin: SupabaseClient,
): Promise<LearnerGrantProgram[]> {
  const { data } = await admin
    .from("grant_programs")
    .select("id, name, criteria, amount_per_learner")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as GrantProgramDbRow[];
  const programs: LearnerGrantProgram[] = [];

  for (const row of rows) {
    const criteriaParsed = GrantCriteriaSchema.safeParse(row.criteria);
    if (!criteriaParsed.success) continue;
    if (typeof row.id !== "string" || typeof row.name !== "string") continue;

    const rawAmount = row.amount_per_learner;
    const amount =
      rawAmount === null || rawAmount === undefined
        ? null
        : Number(rawAmount);

    programs.push({
      id: row.id,
      name: row.name,
      criteria: criteriaParsed.data,
      amountPerLearner: Number.isFinite(amount) ? amount : null,
    });
  }

  return programs;
}

async function loadLatestDisbursements(
  admin: SupabaseClient,
  programIds: string[],
): Promise<Map<string, LatestGrantDisbursement>> {
  if (programIds.length === 0) return new Map();

  const { data } = await admin
    .from("grant_disbursements")
    .select("program_id, created_at, recipients")
    .in("program_id", programIds);

  const rows: LatestGrantDisbursement[] = (data ?? [])
    .map((row) => {
      const programId = (row as { program_id?: unknown }).program_id;
      const createdAt = (row as { created_at?: unknown }).created_at;
      if (typeof programId !== "string" || typeof createdAt !== "string") {
        return null;
      }
      return {
        programId,
        createdAt,
        recipients: (row as { recipients?: unknown }).recipients,
      } satisfies LatestGrantDisbursement;
    })
    .filter((row): row is LatestGrantDisbursement => row !== null);

  return selectLatestDisbursements(rows);
}

export async function getLearnerGrantStatus(
  learnerId: string,
  options?: GetLearnerGrantStatusOptions,
): Promise<LearnerGrantStatusResult> {
  const serviceRoleKey = options?.serviceRoleKey ?? serverEnv.supabaseServiceRoleKey;

  if (!serviceRoleKey) {
    return {
      available: false,
      cards: [],
      errorCode: "service_unavailable",
    };
  }

  try {
    const admin = createAdminClient(serviceRoleKey);
    const programs = await loadPrograms(admin);

    if (programs.length === 0) {
      return { available: true, cards: [] };
    }

    const [snapshot, latestDisbursements] = await Promise.all([
      loadLearnerSnapshot(admin, learnerId),
      loadLatestDisbursements(
        admin,
        programs.map((program) => program.id),
      ),
    ]);

    return {
      available: true,
      cards: buildLearnerGrantStatusCards(
        learnerId,
        programs,
        snapshot,
        latestDisbursements,
      ),
    };
  } catch (error) {
    const name =
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      typeof (error as { name: unknown }).name === "string"
        ? (error as { name: string }).name
        : "";
    const code =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof (error as { code: unknown }).code !== "undefined"
        ? (error as { code: unknown }).code
        : undefined;

    // Navigation/prefetch aborts are expected in dev and should not spam logs.
    if (name !== "AbortError" && code !== 20) {
      console.error("[learner-grants]", error);
    }
    return {
      available: false,
      cards: [],
      errorCode: "query_failed",
    };
  }
}
