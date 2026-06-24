import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ProductHeader } from "@/components/product/product-header";
import { getPublishedCourseDetail } from "@/lib/courses/detail";
import { ensureProfile, getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { parseProgress } from "@/lib/enrollments/progress";
import { CourseDetailView } from "@/components/learner/course-detail-view";
import {
  getSessionDashboardHref,
  navCtaHref,
} from "@/lib/auth/dashboard-href";
import { verifyUrlFor } from "@/lib/credentials/issuer-config";
import { verifyQrDataUrlFor } from "@/lib/credentials/verify-qr";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const tLanding = await getTranslations("Landing");
  const { id } = await params;
  const course = await getPublishedCourseDetail(id);

  if (!course) {
    notFound();
  }

  const { user, dashboardHref } = await getSessionDashboardHref();
  const profile = user ? await ensureProfile() : null;
  const isLearner = profile?.role === "learner";

  const cta = {
    href: navCtaHref(!!user, dashboardHref),
    label:
      user && dashboardHref
        ? tLanding("goToApp")
        : tLanding("navGetStarted"),
  };

  let enrollment: {
    id?: string;
    progress: ReturnType<typeof parseProgress>;
    completed_at: string | null;
  } | null = null;
  let credential: {
    id: string;
    verify_url: string;
    qr_data_url: string;
    network: string;
  } | null = null;

  if (user && isLearner) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("enrollments")
      .select("id, progress, completed_at")
      .eq("learner_id", user.id)
      .eq("course_id", id)
      .maybeSingle();
    if (data) {
      enrollment = {
        id: data.id as string,
        progress: parseProgress(data.progress),
        completed_at: data.completed_at as string | null,
      };
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
  }

  return (
    <div className="product-page flex min-h-full flex-col">
      <ProductHeader cta={cta} />

      <main
        id="main-content"
        className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-8 sm:py-10"
      >
        <CourseDetailView
          course={course}
          backHref="/courses"
          mode="public"
          enrollment={enrollment}
          credential={credential}
          signedIn={Boolean(user)}
        />
      </main>
    </div>
  );
}
