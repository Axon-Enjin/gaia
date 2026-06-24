import { notFound } from "next/navigation";
import { getPublishedCourseDetail } from "@/lib/courses/detail";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { parseProgress } from "@/lib/enrollments/progress";
import { CourseDetailView } from "@/components/learner/course-detail-view";

export default async function LearnerCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getPublishedCourseDetail(id);

  if (!course) {
    notFound();
  }

  const user = await getSessionUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("enrollments")
    .select("progress, completed_at")
    .eq("learner_id", user.id)
    .eq("course_id", id)
    .maybeSingle();

  const enrollment = data
    ? {
        progress: parseProgress(data.progress),
        completed_at: data.completed_at as string | null,
      }
    : null;

  return (
    <CourseDetailView
      course={course}
      backHref="/learner/courses"
      mode="learner"
      enrollment={enrollment}
      signedIn
    />
  );
}
