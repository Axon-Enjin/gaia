import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/auth";
import { ensureEnrollment } from "@/lib/enrollments/complete-lesson";

/**
 * POST /api/enrollments/[courseId]/enroll
 * Idempotent enrollment for authenticated learners.
 */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ courseId: string }> },
) {
  const { courseId } = await ctx.params;
  const idParsed = z.string().uuid().safeParse(courseId);
  if (!idParsed.success) {
    return Response.json({ error: "invalid_course" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const profile = await ensureProfile();
  if (!profile || profile.role !== "learner") {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const { enrollmentId, created } = await ensureEnrollment(
      supabase,
      user.id,
      idParsed.data,
    );
    return Response.json({ enrollment_id: enrollmentId, created });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "enroll_failed";
    if (msg === "course_not_found") {
      return Response.json({ error: "not_found" }, { status: 404 });
    }
    return Response.json({ error: "enroll_failed" }, { status: 500 });
  }
}
