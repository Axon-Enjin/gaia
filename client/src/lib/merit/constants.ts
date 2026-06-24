/** XP awarded per lesson when the quiz is passed (PRD-F3). */
export const XP_LESSON_PASS = 100;

/** XP for maintaining a learning streak (once per calendar day). */
export const XP_STREAK_BONUS = 25;

/** Level thresholds — Seed → Sprout → Scholar → Expert → Mentor (PRD-F3). */
export const LEVELS = [
  { id: "seed", minXp: 0 },
  { id: "sprout", minXp: 500 },
  { id: "scholar", minXp: 2_000 },
  { id: "expert", minXp: 5_000 },
  { id: "mentor", minXp: 10_000 },
] as const;

export type LevelId = (typeof LEVELS)[number]["id"];

export function levelFromXp(totalXp: number): LevelId {
  let current: LevelId = "seed";
  for (const tier of LEVELS) {
    if (totalXp >= tier.minXp) current = tier.id;
  }
  return current;
}

/** Next level XP target; null when at Mentor. */
export function nextLevelMinXp(totalXp: number): number | null {
  for (const tier of LEVELS) {
    if (totalXp < tier.minXp) return tier.minXp;
  }
  return null;
}
