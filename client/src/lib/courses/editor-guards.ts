import type { SupabaseClient } from "@supabase/supabase-js";

/** Teacher owns course and it is still a draft (editable). */
export async function assertTeacherDraftCourse(
  supabase: SupabaseClient,
  courseId: string,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: course } = await supabase
    .from("courses")
    .select("id, teacher_id, status")
    .eq("id", courseId)
    .maybeSingle();

  if (!course || course.teacher_id !== userId) {
    return { ok: false, error: "forbidden" };
  }
  if (course.status !== "draft") {
    return { ok: false, error: "not_draft" };
  }
  return { ok: true };
}

/** Lesson belongs to the given course. */
export async function assertLessonInCourse(
  supabase: SupabaseClient,
  lessonId: string,
  courseId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("lessons")
    .select("id")
    .eq("id", lessonId)
    .eq("course_id", courseId)
    .maybeSingle();
  return Boolean(data);
}

/** Quiz question belongs to a lesson in the given course. */
export async function assertQuestionInCourse(
  supabase: SupabaseClient,
  questionId: string,
  courseId: string,
): Promise<boolean> {
  const { data: question } = await supabase
    .from("quiz_questions")
    .select("lesson_id")
    .eq("id", questionId)
    .maybeSingle();

  if (!question?.lesson_id) return false;

  return assertLessonInCourse(
    supabase,
    question.lesson_id as string,
    courseId,
  );
}
