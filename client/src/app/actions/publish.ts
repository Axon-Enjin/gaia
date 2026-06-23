"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { COURSES_CACHE_TAG } from "@/lib/courses/catalog";

const PublishSchema = z.object({ courseId: z.string().uuid() });

export interface PublishState {
  error?: string;
  ok?: boolean;
}

/**
 * Publish a teacher-reviewed draft (PRD-F1; no auto-publish).
 *
 * Server-side guards:
 *   * Authenticated teacher only.
 *   * Ownership enforced by RLS (`courses_update_own`) AND an explicit
 *     teacher_id match — never trust the client.
 *   * Draft must meet the minimum content bar (>= 1 lesson, >= 3 quiz Qs),
 *     mirroring the generation contract.
 * On success, revalidate the cached catalog so the course appears in /courses.
 */
export async function publishCourseAction(
  _prev: PublishState,
  formData: FormData,
): Promise<PublishState> {
  const parsed = PublishSchema.safeParse({ courseId: formData.get("courseId") });
  if (!parsed.success) return { error: "invalid_request" };
  const { courseId } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthorized" };

  // Verify ownership + current status.
  const { data: course } = await supabase
    .from("courses")
    .select("id, teacher_id, status")
    .eq("id", courseId)
    .single();
  if (!course || course.teacher_id !== user.id) return { error: "forbidden" };
  if (course.status === "published") return { ok: true }; // idempotent

  // Minimum content bar: >= 1 lesson and >= 3 quiz questions.
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id")
    .eq("course_id", courseId);
  const lessonIds = (lessons ?? []).map((l) => l.id as string);
  if (lessonIds.length < 1) return { error: "not_enough_content" };

  const { count: quizCount } = await supabase
    .from("quiz_questions")
    .select("id", { count: "exact", head: true })
    .in("lesson_id", lessonIds);
  if ((quizCount ?? 0) < 3) return { error: "not_enough_content" };

  const { error } = await supabase
    .from("courses")
    .update({ status: "published" })
    .eq("id", courseId)
    .eq("teacher_id", user.id); // belt-and-suspenders with RLS
  if (error) return { error: "publish_failed" };

  // The catalog/detail reads are cached with this tag under the "hours"
  // profile — refresh them (Next 16 requires the cacheLife profile here).
  revalidateTag(COURSES_CACHE_TAG, "hours");
  return { ok: true };
}
