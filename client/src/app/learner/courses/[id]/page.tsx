import { notFound } from "next/navigation";
import { getPublishedCourseDetail } from "@/lib/courses/detail";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { parseProgress } from "@/lib/enrollments/progress";
import { CourseDetailView } from "@/components/learner/course-detail-view";
import { verifyUrlFor } from "@/lib/credentials/issuer-config";
import { verifyQrDataUrlFor } from "@/lib/credentials/verify-qr";

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
    .select("id, progress, completed_at")
    .eq("learner_id", user.id)
    .eq("course_id", id)
    .maybeSingle();

  const enrollment = data
    ? {
        id: data.id as string,
        progress: parseProgress(data.progress),
        completed_at: data.completed_at as string | null,
      }
    : null;

  let credential: {
    id: string;
    verify_url: string;
    qr_data_url: string;
    network: string;
  } | null = null;
  if (enrollment) {
    const { data: cred } = await supabase
      .from("credentials")
      .select("id, network")
      .eq("learner_id", user.id)
      .eq("course_id", id)
      .maybeSingle();
    if (cred) {
      const credId = cred.id as string;
      credential = {
        id: credId,
        verify_url: verifyUrlFor(credId),
        qr_data_url: await verifyQrDataUrlFor(credId),
        network: cred.network as string,
      };
    }
  }

  return (
    <CourseDetailView
      course={course}
      backHref="/learner/courses"
      mode="learner"
      enrollment={enrollment}
      credential={credential}
      signedIn
    />
  );
}
