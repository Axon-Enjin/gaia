import { createAdminClient } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env";
import type { GrantCriteria } from "@/lib/grants/criteria-schema";
import { hashCriteria } from "@/lib/grants/criteria-hash";

export interface EligibleRecipient {
  learner_id: string;
  display_name: string | null;
  total_xp: number;
  badge_types: string[];
  matched_industry: string;
}

export interface LearnerMeritRow {
  learner_id: string;
  display_name: string | null;
  total_xp: number;
  badge_types: string[];
  completed_industries: string[];
  credential_industries: string[];
}

/** Pure filter — unit-tested without DB. */
export function filterEligibleRecipients(
  learners: LearnerMeritRow[],
  criteria: GrantCriteria,
): EligibleRecipient[] {
  const industry = criteria.industry.trim();
  const required = criteria.required_badges ?? [];

  const matched = learners.filter((row) => {
    if (row.total_xp < criteria.min_xp) return false;
    if (!row.completed_industries.some((i) => i === industry)) return false;
    if (criteria.require_credential) {
      if (!row.credential_industries.some((i) => i === industry)) return false;
    }
    for (const badge of required) {
      if (!row.badge_types.includes(badge)) return false;
    }
    return true;
  });

  return matched
    .map((row) => ({
      learner_id: row.learner_id,
      display_name: row.display_name,
      total_xp: row.total_xp,
      badge_types: [...row.badge_types],
      matched_industry: industry,
    }))
    .sort((a, b) => b.total_xp - a.total_xp);
}

export interface EvaluateResult {
  recipients: EligibleRecipient[];
  match_count: number;
  criteria_hash: string;
}

function admin() {
  return createAdminClient(serverEnv.supabaseServiceRoleKeyRequired);
}

/** Load learner merit aggregates and evaluate criteria (service role). */
export async function evaluateGrantCriteria(
  criteria: GrantCriteria,
): Promise<EvaluateResult> {
  const client = admin();

  const { data: profiles } = await client
    .from("profiles")
    .select("id, display_name")
    .eq("role", "learner");

  const learnerRows = profiles ?? [];

  if (learnerRows.length === 0) {
    return {
      recipients: [],
      match_count: 0,
      criteria_hash: hashCriteria(criteria),
    };
  }

  const learnerIds = new Set(learnerRows.map((p) => p.id as string));

  const { data: ledgerRows } = await client
    .from("merit_ledger")
    .select("learner_id, xp_delta");

  const xpByLearner = new Map<string, number>();
  for (const row of ledgerRows ?? []) {
    const id = row.learner_id as string;
    if (!learnerIds.has(id)) continue;
    xpByLearner.set(id, (xpByLearner.get(id) ?? 0) + (row.xp_delta as number));
  }

  const { data: badgeRows } = await client.from("badges").select("learner_id, badge_type");

  const badgesByLearner = new Map<string, string[]>();
  for (const row of badgeRows ?? []) {
    const id = row.learner_id as string;
    if (!learnerIds.has(id)) continue;
    const list = badgesByLearner.get(id) ?? [];
    list.push(row.badge_type as string);
    badgesByLearner.set(id, list);
  }

  const { data: enrollmentRows } = await client
    .from("enrollments")
    .select("learner_id, completed_at, courses(industry)");

  const completedIndustriesByLearner = new Map<string, Set<string>>();
  for (const row of enrollmentRows ?? []) {
    const id = row.learner_id as string;
    if (!row.completed_at || !learnerIds.has(id)) continue;
    const raw = row.courses as { industry: string } | { industry: string }[] | null;
    const course = Array.isArray(raw) ? raw[0] : raw;
    if (!course?.industry) continue;
    const set = completedIndustriesByLearner.get(id) ?? new Set<string>();
    set.add(course.industry);
    completedIndustriesByLearner.set(id, set);
  }

  const { data: credentialRows } = await client
    .from("credentials")
    .select("learner_id, courses(industry)");

  const credentialIndustriesByLearner = new Map<string, Set<string>>();
  for (const row of credentialRows ?? []) {
    const id = row.learner_id as string;
    if (!learnerIds.has(id)) continue;
    const raw = row.courses as { industry: string } | { industry: string }[] | null;
    const course = Array.isArray(raw) ? raw[0] : raw;
    if (!course?.industry) continue;
    const set = credentialIndustriesByLearner.get(id) ?? new Set<string>();
    set.add(course.industry);
    credentialIndustriesByLearner.set(id, set);
  }

  const meritRows: LearnerMeritRow[] = learnerRows.map((p) => {
    const id = p.id as string;
    return {
      learner_id: id,
      display_name: p.display_name as string | null,
      total_xp: xpByLearner.get(id) ?? 0,
      badge_types: badgesByLearner.get(id) ?? [],
      completed_industries: [
        ...Array.from(completedIndustriesByLearner.get(id) ?? []),
      ],
      credential_industries: [
        ...Array.from(credentialIndustriesByLearner.get(id) ?? []),
      ],
    };
  });

  const recipients = filterEligibleRecipients(meritRows, criteria);

  return {
    recipients,
    match_count: recipients.length,
    criteria_hash: hashCriteria(criteria),
  };
}
