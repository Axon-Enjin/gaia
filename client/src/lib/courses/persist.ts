import type { SupabaseClient } from "@supabase/supabase-js";
import type { Course } from "@/lib/ai/course-schema";

export interface PersistedDraft {
  courseId: string;
  lessonCount: number;
  quizCount: number;
}

/**
 * Persist a validated AI draft as a `draft` course + its lessons + quiz
 * questions (rfc-aniskwela-002 §2 step 4). The SDD schema has lessons directly under
 * courses, so modules are flattened into a continuous `order_index`.
 *
 * RLS enforces that `teacherId` owns the inserted rows — the caller must pass
 * the authenticated user's id, never a client-supplied one.
 *
 * Status is always 'draft'. Publishing is a separate, explicit teacher action
 * (no auto-publish — AGENTS.md invariant).
 */
export async function persistDraftCourse(
  supabase: SupabaseClient,
  teacherId: string,
  course: Course,
  meta: { sourceObjectPath?: string } = {},
): Promise<PersistedDraft> {
  const { data: courseRow, error: courseError } = await supabase
    .from("courses")
    .insert({
      teacher_id: teacherId,
      title: course.title,
      industry: course.industry,
      mode: "ai_assist",
      status: "draft",
      source_object_path: meta.sourceObjectPath ?? null,
    })
    .select("id")
    .single();

  if (courseError || !courseRow) {
    throw new Error(`failed to insert course: ${courseError?.message}`);
  }
  const courseId = courseRow.id as string;

  // Flatten modules -> lessons with a continuous order index.
  const lessons = course.modules.flatMap((module) => module.lessons);

  let lessonCount = 0;
  let quizCount = 0;

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];

    const { data: lessonRow, error: lessonError } = await supabase
      .from("lessons")
      .insert({
        course_id: courseId,
        order_index: i,
        title: lesson.title,
        body_md: lesson.body_md,
        difficulty: lesson.difficulty,
      })
      .select("id")
      .single();

    if (lessonError || !lessonRow) {
      throw new Error(`failed to insert lesson: ${lessonError?.message}`);
    }
    lessonCount++;

    if (lesson.quiz.length > 0) {
      const { error: quizError } = await supabase.from("quiz_questions").insert(
        lesson.quiz.map((q) => ({
          lesson_id: lessonRow.id as string,
          prompt: q.prompt,
          choices: q.choices,
          answer_index: q.answer_index,
        })),
      );
      if (quizError) {
        throw new Error(`failed to insert quiz questions: ${quizError.message}`);
      }
      quizCount += lesson.quiz.length;
    }
  }

  return { courseId, lessonCount, quizCount };
}
