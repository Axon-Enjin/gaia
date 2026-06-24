import { createAdminClient } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env";
import { XP_LESSON_PASS, XP_STREAK_BONUS } from "@/lib/merit/constants";
import { computeStreakDayKeys } from "@/lib/merit/streak";

export interface MeritSummary {
  totalXp: number;
  streakDays: number;
  badgeTypes: string[];
}

function admin() {
  return createAdminClient(serverEnv.supabaseServiceRoleKeyRequired);
}

export async function getMeritSummary(learnerId: string): Promise<MeritSummary> {
  const client = admin();

  const { data: events } = await client
    .from("merit_ledger")
    .select("xp_delta, created_at")
    .eq("learner_id", learnerId)
    .order("created_at", { ascending: false });

  const rows = events ?? [];
  const totalXp = rows.reduce((sum, e) => sum + (e.xp_delta as number), 0);
  const streakDays = computeStreakDayKeys(
    rows.map((e) => e.created_at as string),
  );

  const { data: badges } = await client
    .from("badges")
    .select("badge_type")
    .eq("learner_id", learnerId);

  return {
    totalXp,
    streakDays,
    badgeTypes: (badges ?? []).map((b) => b.badge_type as string),
  };
}

export async function insertMeritEvent(
  learnerId: string,
  eventType: "lesson" | "quiz" | "streak" | "help",
  xpDelta: number,
  refId?: string,
): Promise<void> {
  if (xpDelta < 0) throw new Error("xp_delta must be >= 0");
  const { error } = await admin().from("merit_ledger").insert({
    learner_id: learnerId,
    event_type: eventType,
    xp_delta: xpDelta,
    ref_id: refId ?? null,
  });
  if (error) throw new Error(error.message);
}

export async function awardLessonXp(
  learnerId: string,
  lessonId: string,
): Promise<number> {
  await insertMeritEvent(learnerId, "lesson", XP_LESSON_PASS, lessonId);
  return XP_LESSON_PASS;
}

/** Award streak bonus once per learner per UTC day. */
export async function maybeAwardStreakBonus(
  learnerId: string,
): Promise<number> {
  const client = admin();
  const today = new Date().toISOString().slice(0, 10);

  const { data: todayStreak } = await client
    .from("merit_ledger")
    .select("id")
    .eq("learner_id", learnerId)
    .eq("event_type", "streak")
    .gte("created_at", `${today}T00:00:00.000Z`)
    .lt("created_at", `${today}T23:59:59.999Z`)
    .limit(1);

  if (todayStreak && todayStreak.length > 0) return 0;

  await insertMeritEvent(learnerId, "streak", XP_STREAK_BONUS);
  return XP_STREAK_BONUS;
}

export async function awardBadgeIfNew(
  learnerId: string,
  badgeType: string,
): Promise<boolean> {
  const client = admin();
  const { data: existing } = await client
    .from("badges")
    .select("id")
    .eq("learner_id", learnerId)
    .eq("badge_type", badgeType)
    .limit(1);

  if (existing && existing.length > 0) return false;

  const { error } = await client.from("badges").insert({
    learner_id: learnerId,
    badge_type: badgeType,
  });
  if (error) throw new Error(error.message);
  return true;
}
