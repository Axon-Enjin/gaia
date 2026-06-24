import { z } from "zod";

export const LessonProgressSchema = z.object({
  completed_at: z.string(),
  quiz_correct: z.number().int().min(0),
  quiz_total: z.number().int().min(0),
  quiz_passed: z.boolean(),
  xp_awarded: z.number().int().min(0),
});

export type LessonProgress = z.infer<typeof LessonProgressSchema>;

export type EnrollmentProgress = Record<string, LessonProgress>;

export function parseProgress(raw: unknown): EnrollmentProgress {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: EnrollmentProgress = {};
  for (const [lessonId, value] of Object.entries(raw as Record<string, unknown>)) {
    const parsed = LessonProgressSchema.safeParse(value);
    if (parsed.success) out[lessonId] = parsed.data;
  }
  return out;
}

export function isLessonComplete(
  progress: EnrollmentProgress,
  lessonId: string,
): boolean {
  return Boolean(progress[lessonId]?.quiz_passed);
}
