import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { COURSES_CACHE_TAG } from "@/lib/courses/catalog";

export interface DetailQuestion {
  id: string;
  prompt: string;
  choices: string[];
}

export interface DetailLesson {
  id: string;
  order_index: number;
  title: string;
  body_md: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  questions: DetailQuestion[];
}

export interface CourseDetail {
  id: string;
  title: string;
  industry: string;
  lessons: DetailLesson[];
}

/**
 * Full published-course detail for the learner read path (PRD-F: view a course).
 *
 * Cost-gated + cached: cookieless public client (so it is safely cacheable),
 * `'use cache'` + the shared catalog tag so publish/unpublish invalidates it.
 * Touches the DB only — NEVER the AI pipeline.
 *
 * RLS: an anon request sees a course's lessons/quiz only if the course is
 * published, so drafts return null here for the public.
 */
export async function getPublishedCourseDetail(
  courseId: string,
): Promise<CourseDetail | null> {
  "use cache";
  cacheTag(COURSES_CACHE_TAG);
  cacheLife("hours");

  const supabase = createPublicClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, industry")
    .eq("id", courseId)
    .eq("status", "published")
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

  return {
    id: course.id,
    title: course.title,
    industry: course.industry,
    lessons: lessonRows.map((l) => ({
      id: l.id,
      order_index: l.order_index,
      title: l.title,
      body_md: l.body_md,
      difficulty: l.difficulty,
      questions: byLesson.get(l.id) ?? [],
    })),
  };
}
