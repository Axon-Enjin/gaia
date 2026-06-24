import type { SupabaseClient } from "@supabase/supabase-js";
import type { CourseDetail, DetailLesson, DetailQuestion } from "@/lib/courses/detail";

export interface TeacherCourse {
  id: string;
  title: string;
  industry: string;
  status: "draft" | "published";
  created_at: string;
  lessonCount: number;
}

export interface TeacherCourseStats {
  publishedCount: number;
  draftCount: number;
}

/** A teacher's own courses (RLS limits rows to the authenticated teacher). */
export async function getTeacherCourses(
  supabase: SupabaseClient,
  teacherId: string,
): Promise<TeacherCourse[]> {
  const { data } = await supabase
    .from("courses")
    .select("id, title, industry, status, created_at, lessons(count)")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id as string,
    title: row.title as string,
    industry: row.industry as string,
    status: row.status as "draft" | "published",
    created_at: row.created_at as string,
    lessonCount:
      (row.lessons as { count: number }[] | null)?.[0]?.count ?? 0,
  }));
}

export function getTeacherCourseStats(
  courses: TeacherCourse[],
): TeacherCourseStats {
  let publishedCount = 0;
  let draftCount = 0;
  for (const c of courses) {
    if (c.status === "published") publishedCount++;
    else draftCount++;
  }
  return { publishedCount, draftCount };
}

export interface TeacherCourseDetail extends CourseDetail {
  status: "draft" | "published";
}

/** Teacher-owned course detail — draft or published; not cached. */
export async function getTeacherCourseDetail(
  supabase: SupabaseClient,
  courseId: string,
  teacherId: string,
): Promise<TeacherCourseDetail | null> {
  const { data: course } = await supabase
    .from("courses")
    .select("id, title, industry, passing_score, status, teacher_id")
    .eq("id", courseId)
    .eq("teacher_id", teacherId)
    .maybeSingle();

  if (!course) return null;

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, order_index, title, body_md, difficulty")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });

  const lessonRows = lessons ?? [];
  const lessonIds = lessonRows.map((l) => l.id as string);

  const { data: questions } = lessonIds.length
    ? await supabase
        .from("quiz_questions")
        .select("id, lesson_id, prompt, choices")
        .in("lesson_id", lessonIds)
    : { data: [] as { id: string; lesson_id: string; prompt: string; choices: string[] }[] };

  const byLesson = new Map<string, DetailQuestion[]>();
  for (const q of questions ?? []) {
    const list = byLesson.get(q.lesson_id) ?? [];
    list.push({ id: q.id, prompt: q.prompt, choices: q.choices });
    byLesson.set(q.lesson_id, list);
  }

  const detailLessons: DetailLesson[] = lessonRows.map((l) => ({
    id: l.id as string,
    order_index: l.order_index as number,
    title: l.title as string,
    body_md: l.body_md as string,
    difficulty: l.difficulty as DetailLesson["difficulty"],
    questions: byLesson.get(l.id as string) ?? [],
  }));

  return {
    id: course.id as string,
    title: course.title as string,
    industry: course.industry as string,
    passing_score: course.passing_score as number,
    status: course.status as "draft" | "published",
    lessons: detailLessons,
  };
}
