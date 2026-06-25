import { z } from "zod";

/** Known badge types awardable in MVP (PRD-F3). */
export const GRANT_BADGE_TYPES = [
  "consistent_learner",
  "course_complete",
] as const;

export type GrantBadgeType = (typeof GRANT_BADGE_TYPES)[number];

export const GrantCriteriaSchema = z.object({
  industry: z.string().trim().min(1).max(80),
  min_xp: z.number().int().min(0).max(1_000_000),
  required_badges: z
    .array(z.enum(GRANT_BADGE_TYPES))
    .optional()
    .default([]),
  require_credential: z.boolean().optional().default(false),
});

export type GrantCriteria = z.infer<typeof GrantCriteriaSchema>;

export const CreateGrantProgramSchema = z.object({
  name: z.string().trim().min(1).max(120),
  criteria: GrantCriteriaSchema,
  amount_per_learner: z.number().positive().max(10_000_000).optional(),
});

export type CreateGrantProgramInput = z.infer<typeof CreateGrantProgramSchema>;
