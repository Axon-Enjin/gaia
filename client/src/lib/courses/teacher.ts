import type { SupabaseClient } from "@supabase/supabase-js";

export interface TeacherCourse {
  id: string;
  title: string;
  industry: string;
  status: "draft" | "published";
  created_at: string;
}

/** A teacher's own courses (RLS limits rows to the authenticated teacher). */
export async function getTeacherCourses(
  supabase: SupabaseClient,
  teacherId: string,
): Promise<TeacherCourse[]> {
  const { data } = await supabase
    .from("courses")
    .select("id, title, industry, status, created_at")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });
  return (data as TeacherCourse[] | null) ?? [];
}
