import type { SupabaseClient } from "@supabase/supabase-js";
import {
  awardBadgeIfNew,
  awardLessonXp,
  getMeritSummary,
  maybeAwardStreakBonus,
} from "@/lib/merit/ledger";
import {
  isLessonComplete,
  parseProgress,
  type EnrollmentProgress,
  type LessonProgress,
} from "@/lib/enrollments/progress";

export interface CompleteLessonInput {
  learnerId: string;
  courseId: string;
  lessonId: string;
  /** question_id → chosen choice index */
  answers: Record<string, number>;
}

export interface CompleteLessonResult {
  alreadyCompleted: boolean;
  lessonProgress: LessonProgress;
  xpAwarded: number;
  streakBonus: number;
  courseCompleted: boolean;
  finalScore: number | null;
  badgesAwarded: string[];
}

export class CompleteLessonError extends Error {
  constructor(
    message: string,
    public code:
      | "not_found"
      | "forbidden"
      | "invalid_quiz"
      | "not_enrolled"
      | "service_unavailable",
  ) {
    super(message);
  }
}

export async function completeLesson(
  supabase: SupabaseClient,
  input: CompleteLessonInput,
): Promise<CompleteLessonResult> {
  const { learnerId, courseId, lessonId, answers } = input;

  const { data: course } = await supabase
    .from("courses")
    .select("id, status, passing_score")
    .eq("id", courseId)
    .eq("status", "published")
    .maybeSingle();
  if (!course) throw new CompleteLessonError("Course not found", "not_found");

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, progress, completed_at")
    .eq("learner_id", learnerId)
    .eq("course_id", courseId)
    .maybeSingle();
  if (!enrollment) {
    throw new CompleteLessonError("Not enrolled", "not_enrolled");
  }

  const progress = parseProgress(enrollment.progress);
  if (isLessonComplete(progress, lessonId)) {
    return {
      alreadyCompleted: true,
      lessonProgress: progress[lessonId],
      xpAwarded: 0,
      streakBonus: 0,
      courseCompleted: Boolean(enrollment.completed_at),
      finalScore: null,
      badgesAwarded: [],
    };
  }

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, course_id")
    .eq("id", lessonId)
    .eq("course_id", courseId)
    .maybeSingle();
  if (!lesson) throw new CompleteLessonError("Lesson not found", "not_found");

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("id, answer_index")
    .eq("lesson_id", lessonId);

  const qs = questions ?? [];
  let correct = 0;
  for (const q of qs) {
    const chosen = answers[q.id as string];
    if (typeof chosen !== "number") {
      throw new CompleteLessonError("Missing quiz answers", "invalid_quiz");
    }
    if (chosen === q.answer_index) correct++;
  }

  const quizTotal = qs.length;
  const scorePct =
    quizTotal > 0 ? Math.round((correct / quizTotal) * 100) : 100;
  const passingScore = course.passing_score as number;
  const quizPassed =
    quizTotal === 0 ? true : scorePct >= passingScore;

  if (!quizPassed) {
    throw new CompleteLessonError(
      `Quiz score ${scorePct}% below passing ${passingScore}%`,
      "invalid_quiz",
    );
  }

  let xpAwarded = 0;
  let streakBonus = 0;
  const badgesAwarded: string[] = [];

  xpAwarded = await awardLessonXp(learnerId, lessonId);
  streakBonus = await maybeAwardStreakBonus(learnerId);

  if (await awardBadgeIfNew(learnerId, "first_lesson")) {
    badgesAwarded.push("first_lesson");
  }

  const lessonProgress: LessonProgress = {
    completed_at: new Date().toISOString(),
    quiz_correct: correct,
    quiz_total: quizTotal,
    quiz_passed: true,
    xp_awarded: xpAwarded,
  };

  const nextProgress: EnrollmentProgress = {
    ...progress,
    [lessonId]: lessonProgress,
  };

  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id")
    .eq("course_id", courseId);

  const lessonIds = (allLessons ?? []).map((l) => l.id as string);
  const allDone = lessonIds.every((id) =>
    id === lessonId ? true : isLessonComplete(nextProgress, id),
  );

  let finalScore: number | null = null;
  let courseCompleted = false;

  if (allDone) {
    const scores = lessonIds
      .map((id) => nextProgress[id])
      .filter(Boolean)
      .map((p) =>
        p.quiz_total > 0
          ? Math.round((p.quiz_correct / p.quiz_total) * 100)
          : 100,
      );
    finalScore = Math.round(
      scores.reduce((a, b) => a + b, 0) / scores.length,
    );
    courseCompleted = true;

    if (await awardBadgeIfNew(learnerId, "course_complete")) {
      badgesAwarded.push("course_complete");
    }
  }

  const { error: updateError } = await supabase
    .from("enrollments")
    .update({
      progress: nextProgress,
      ...(courseCompleted
        ? { completed_at: new Date().toISOString(), final_score: finalScore }
        : {}),
    })
    .eq("id", enrollment.id as string)
    .eq("learner_id", learnerId);

  if (updateError) {
    throw new CompleteLessonError(updateError.message, "service_unavailable");
  }

  const summary = await getMeritSummary(learnerId);
  if (
    summary.streakDays >= 3 &&
    (await awardBadgeIfNew(learnerId, "consistent_learner"))
  ) {
    badgesAwarded.push("consistent_learner");
  }

  return {
    alreadyCompleted: false,
    lessonProgress,
    xpAwarded,
    streakBonus,
    courseCompleted,
    finalScore,
    badgesAwarded,
  };
}

/** Create enrollment if missing (idempotent). */
export async function ensureEnrollment(
  supabase: SupabaseClient,
  learnerId: string,
  courseId: string,
): Promise<{ enrollmentId: string; created: boolean }> {
  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .eq("learner_id", learnerId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (existing) {
    return { enrollmentId: existing.id as string, created: false };
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("id", courseId)
    .eq("status", "published")
    .maybeSingle();
  if (!course) throw new Error("course_not_found");

  const { data: row, error } = await supabase
    .from("enrollments")
    .insert({ learner_id: learnerId, course_id: courseId })
    .select("id")
    .single();

  if (error || !row) throw new Error(error?.message ?? "enroll_failed");
  return { enrollmentId: row.id as string, created: true };
}
