import { createHash } from "node:crypto";
import type { GrantCriteria } from "@/lib/grants/criteria-schema";

/** Canonical JSON for stable audit hashes. */
export function canonicalizeCriteria(criteria: GrantCriteria): string {
  const normalized = {
    industry: criteria.industry.trim(),
    min_xp: criteria.min_xp,
    required_badges: [...(criteria.required_badges ?? [])].sort(),
    require_credential: criteria.require_credential ?? false,
  };
  return JSON.stringify(normalized);
}

export function hashCriteria(criteria: GrantCriteria): string {
  return createHash("sha256").update(canonicalizeCriteria(criteria)).digest("hex");
}
