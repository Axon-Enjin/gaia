import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getTeacherCourseDetail } from "@/lib/courses/teacher";
import { CourseDetailView } from "@/components/learner/course-detail-view";

export default async function TeacherCoursePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return null;

  const supabase = await createClient();
  const course = await getTeacherCourseDetail(supabase, id, user.id);

  if (!course) {
    notFound();
  }

  const { status, ...detail } = course;

  return (
    <CourseDetailView
      course={detail}
      backHref="/teacher/courses"
      mode="teacher"
      enrollment={null}
      signedIn
      teacherStatus={status}
    />
  );
}
