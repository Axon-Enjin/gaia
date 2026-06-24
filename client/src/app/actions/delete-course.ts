"use server";

import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { COURSES_CACHE_TAG } from "@/lib/courses/catalog";

const DeleteSchema = z.object({ courseId: z.string().uuid() });

export interface DeleteCourseState {
  error?: string;
  ok?: boolean;
}

/** Delete a teacher-owned course. Blocked when learners have issued credentials. */
export async function deleteCourseAction(
  _prev: DeleteCourseState,
  formData: FormData,
): Promise<DeleteCourseState> {
  const parsed = DeleteSchema.safeParse({ courseId: formData.get("courseId") });
  if (!parsed.success) return { error: "invalid_request" };
  const { courseId } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthorized" };

  const { data: course } = await supabase
    .from("courses")
    .select("id, teacher_id, title")
    .eq("id", courseId)
    .maybeSingle();

  if (!course || course.teacher_id !== user.id) {
    return { error: "forbidden" };
  }

  const { count: credentialCount } = await supabase
    .from("credentials")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId);

  if ((credentialCount ?? 0) > 0) {
    return { error: "has_credentials" };
  }

  const { error } = await supabase
    .from("courses")
    .delete()
    .eq("id", courseId)
    .eq("teacher_id", user.id);

  if (error) return { error: "delete_failed" };

  revalidateTag(COURSES_CACHE_TAG, "hours");
  revalidatePath("/teacher");
  revalidatePath("/teacher/courses");
  return { ok: true };
}
