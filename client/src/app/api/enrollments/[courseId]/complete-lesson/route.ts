import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/auth";
import {
  completeLesson,
  CompleteLessonError,
  ensureEnrollment,
} from "@/lib/enrollments/complete-lesson";

const BodySchema = z.object({
  lesson_id: z.string().uuid(),
  answers: z.record(z.string().uuid(), z.number().int().min(0)),
});

/**
 * POST /api/enrollments/[courseId]/complete-lesson  (PRD-F2/F3)
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ courseId: string }> },
) {
  const { courseId } = await ctx.params;
  const courseParsed = z.string().uuid().safeParse(courseId);
  if (!courseParsed.success) {
    return Response.json({ error: "invalid_course" }, { status: 400 });
  }

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
  if (!profile || profile.role !== "learner") {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    await ensureEnrollment(supabase, user.id, courseParsed.data);
  } catch {
    return Response.json({ error: "enroll_failed" }, { status: 500 });
  }

  try {
    const result = await completeLesson(supabase, {
      learnerId: user.id,
      courseId: courseParsed.data,
      lessonId: parsed.data.lesson_id,
      answers: parsed.data.answers,
    });

    return Response.json({
      ok: true,
      already_completed: result.alreadyCompleted,
      xp_awarded: result.xpAwarded,
      streak_bonus: result.streakBonus,
      course_completed: result.courseCompleted,
      final_score: result.finalScore,
      badges_awarded: result.badgesAwarded,
      lesson: result.lessonProgress,
    });
  } catch (e) {
    if (e instanceof CompleteLessonError) {
      const status =
        e.code === "not_found"
          ? 404
          : e.code === "forbidden" || e.code === "not_enrolled"
            ? 403
            : e.code === "invalid_quiz"
              ? 422
              : 500;
      return Response.json({ error: e.code, message: e.message }, { status });
    }
    console.error("[complete-lesson]", e);
    return Response.json({ error: "internal_error" }, { status: 500 });
  }
}
