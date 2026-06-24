import type { SupabaseClient } from "@supabase/supabase-js";

export interface CourseAnalytics {
  enrollmentCount: number;
  completedCount: number;
  averageScore: number | null;
  credentialCount: number;
}

/** Per-course learner stats for the owning teacher (PRD-F6). Requires 0006 RLS. */
export async function getTeacherCourseAnalytics(
  supabase: SupabaseClient,
  courseId: string,
  teacherId: string,
): Promise<CourseAnalytics | null> {
  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("id", courseId)
    .eq("teacher_id", teacherId)
    .maybeSingle();

  if (!course) return null;

  const { count: enrollmentCount } = await supabase
    .from("enrollments")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId);

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("completed_at, final_score")
    .eq("course_id", courseId);

  const rows = enrollments ?? [];
  const completedCount = rows.filter((e) => e.completed_at).length;
  const scores = rows
    .map((e) => e.final_score as number | null)
    .filter((s): s is number => s !== null && s !== undefined);
  const averageScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

  const { count: credentialCount } = await supabase
    .from("credentials")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId);

  return {
    enrollmentCount: enrollmentCount ?? 0,
    completedCount,
    averageScore,
    credentialCount: credentialCount ?? 0,
  };
}
