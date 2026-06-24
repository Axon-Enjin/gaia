"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  assertLessonInCourse,
  assertQuestionInCourse,
  assertTeacherDraftCourse,
} from "@/lib/courses/editor-guards";
import {
  CourseSettingsSchema,
  LessonUpdateSchema,
  QuizUpdateSchema,
} from "@/lib/courses/editor-schemas";

export interface EditorActionState {
  ok?: boolean;
  error?: string;
  field?: string;
}

const initial: EditorActionState = {};

function parseJsonField<T>(raw: FormDataEntryValue | null): T | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function saveCourseSettingsAction(
  _prev: EditorActionState,
  formData: FormData,
): Promise<EditorActionState> {
  const parsed = CourseSettingsSchema.safeParse({
    courseId: formData.get("courseId"),
    title: formData.get("title"),
    industry: formData.get("industry"),
    passing_score: formData.get("passing_score"),
  });
  if (!parsed.success) return { error: "invalid_request" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthorized" };

  const guard = await assertTeacherDraftCourse(
    supabase,
    parsed.data.courseId,
    user.id,
  );
  if (!guard.ok) return { error: guard.error };

  const { error } = await supabase
    .from("courses")
    .update({
      title: parsed.data.title,
      industry: parsed.data.industry,
      passing_score: parsed.data.passing_score,
    })
    .eq("id", parsed.data.courseId)
    .eq("teacher_id", user.id);

  if (error) return { error: "save_failed" };

  revalidatePath(`/teacher/courses/${parsed.data.courseId}/edit`);
  revalidatePath(`/teacher/courses/${parsed.data.courseId}`);
  return { ok: true };
}

export async function saveLessonAction(
  _prev: EditorActionState,
  formData: FormData,
): Promise<EditorActionState> {
  const parsed = LessonUpdateSchema.safeParse({
    courseId: formData.get("courseId"),
    lessonId: formData.get("lessonId"),
    title: formData.get("title"),
    body_md: formData.get("body_md"),
    difficulty: formData.get("difficulty"),
  });
  if (!parsed.success) return { error: "invalid_request" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthorized" };

  const guard = await assertTeacherDraftCourse(
    supabase,
    parsed.data.courseId,
    user.id,
  );
  if (!guard.ok) return { error: guard.error };

  const inCourse = await assertLessonInCourse(
    supabase,
    parsed.data.lessonId,
    parsed.data.courseId,
  );
  if (!inCourse) return { error: "forbidden" };

  const { error } = await supabase
    .from("lessons")
    .update({
      title: parsed.data.title,
      body_md: parsed.data.body_md,
      difficulty: parsed.data.difficulty,
    })
    .eq("id", parsed.data.lessonId);

  if (error) return { error: "save_failed" };

  revalidatePath(`/teacher/courses/${parsed.data.courseId}/edit`);
  return { ok: true };
}

export async function saveQuizQuestionAction(
  _prev: EditorActionState,
  formData: FormData,
): Promise<EditorActionState> {
  const choices = parseJsonField<string[]>(formData.get("choices"));
  if (!choices) return { error: "invalid_request" };

  const parsed = QuizUpdateSchema.safeParse({
    courseId: formData.get("courseId"),
    questionId: formData.get("questionId"),
    prompt: formData.get("prompt"),
    choices,
    answer_index: formData.get("answer_index"),
  });
  if (!parsed.success) return { error: "invalid_request" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthorized" };

  const guard = await assertTeacherDraftCourse(
    supabase,
    parsed.data.courseId,
    user.id,
  );
  if (!guard.ok) return { error: guard.error };

  const inCourse = await assertQuestionInCourse(
    supabase,
    parsed.data.questionId,
    parsed.data.courseId,
  );
  if (!inCourse) return { error: "forbidden" };

  const { error } = await supabase
    .from("quiz_questions")
    .update({
      prompt: parsed.data.prompt,
      choices: parsed.data.choices,
      answer_index: parsed.data.answer_index,
    })
    .eq("id", parsed.data.questionId);

  if (error) return { error: "save_failed" };

  revalidatePath(`/teacher/courses/${parsed.data.courseId}/edit`);
  return { ok: true };
}

export const editorActionInitial = initial;
