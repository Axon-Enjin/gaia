import type { SupabaseClient } from "@supabase/supabase-js";

export interface LearnerCredentialSummary {
  id: string;
  course_id: string;
  course_title: string;
  course_industry: string;
  issued_at: string;
  network: string;
  final_score: number | null;
}

function courseFromJoin(raw: unknown): { title: string; industry: string } | null {
  if (!raw || typeof raw !== "object") return null;
  const row = Array.isArray(raw) ? raw[0] : raw;
  if (!row || typeof row !== "object") return null;
  return {
    title: (row as { title: string }).title,
    industry: (row as { industry: string }).industry,
  };
}

/** List credentials for the signed-in learner (RLS-backed). */
export async function listLearnerCredentials(
  supabase: SupabaseClient,
  learnerId: string,
): Promise<LearnerCredentialSummary[]> {
  const { data, error } = await supabase
    .from("credentials")
    .select("id, course_id, issued_at, network, courses(title, industry)")
    .eq("learner_id", learnerId)
    .order("issued_at", { ascending: false });

  if (error || !data) return [];

  const summaries: LearnerCredentialSummary[] = [];
  for (const row of data) {
    const courses = courseFromJoin(row.courses);
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("final_score")
      .eq("learner_id", learnerId)
      .eq("course_id", row.course_id as string)
      .maybeSingle();

    summaries.push({
      id: row.id as string,
      course_id: row.course_id as string,
      course_title: courses?.title ?? "Course",
      course_industry: courses?.industry ?? "",
      issued_at: row.issued_at as string,
      network: row.network as string,
      final_score: (enrollment?.final_score as number | null) ?? null,
    });
  }
  return summaries;
}

export async function getLearnerCredentialById(
  supabase: SupabaseClient,
  learnerId: string,
  credentialId: string,
) {
  const { data } = await supabase
    .from("credentials")
    .select("id, course_id, issued_at, network, stellar_tx_hash, courses(title, industry)")
    .eq("id", credentialId)
    .eq("learner_id", learnerId)
    .maybeSingle();

  if (!data) return null;

  const courses = courseFromJoin(data.courses);
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("final_score")
    .eq("learner_id", learnerId)
    .eq("course_id", data.course_id as string)
    .maybeSingle();

  return {
    id: data.id as string,
    course_id: data.course_id as string,
    course_title: courses?.title ?? "Course",
    course_industry: courses?.industry ?? "",
    issued_at: data.issued_at as string,
    network: data.network as string,
    stellar_tx_hash: (data.stellar_tx_hash as string | null) ?? null,
    final_score: (enrollment?.final_score as number | null) ?? null,
  };
}
