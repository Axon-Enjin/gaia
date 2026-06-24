import type { SupabaseClient } from "@supabase/supabase-js";
import QRCode from "qrcode";
import { buildUnsignedVc } from "@/lib/credentials/build-vc";
import { credentialHashHex } from "@/lib/credentials/canonicalize";
import { anchorHash } from "@/lib/credentials/anchor";
import { verifyUrlFor } from "@/lib/credentials/issuer-config";
import { signVc, stripProof } from "@/lib/credentials/sign";
import type { IssueResponse } from "@/lib/credentials/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env";

export class IssueCredentialError extends Error {
  constructor(
    message: string,
    public code:
      | "not_found"
      | "forbidden"
      | "not_completed"
      | "below_passing"
      | "already_issued"
      | "anchor_failed"
      | "service_unavailable",
    public existingCredentialId?: string,
  ) {
    super(message);
  }
}

interface EligibleEnrollment {
  id: string;
  learner_id: string;
  course_id: string;
  completed_at: string;
  final_score: number;
  course: {
    title: string;
    industry: string;
    passing_score: number;
    status: string;
  };
}

async function loadEligibleEnrollment(
  supabase: SupabaseClient,
  enrollmentId: string,
  learnerId: string,
): Promise<EligibleEnrollment> {
  const { data: enrollment, error } = await supabase
    .from("enrollments")
    .select("id, learner_id, course_id, completed_at, final_score")
    .eq("id", enrollmentId)
    .maybeSingle();

  if (error || !enrollment) {
    throw new IssueCredentialError("Enrollment not found", "not_found");
  }
  if (enrollment.learner_id !== learnerId) {
    throw new IssueCredentialError("Not your enrollment", "forbidden");
  }
  if (!enrollment.completed_at) {
    throw new IssueCredentialError("Course not completed", "not_completed");
  }

  const { data: course } = await supabase
    .from("courses")
    .select("title, industry, passing_score, status")
    .eq("id", enrollment.course_id as string)
    .maybeSingle();

  if (!course || course.status !== "published") {
    throw new IssueCredentialError("Course not found", "not_found");
  }

  const finalScore = enrollment.final_score as number | null;
  const passingScore = course.passing_score as number;
  if (finalScore === null || finalScore < passingScore) {
    throw new IssueCredentialError(
      `Final score ${finalScore ?? 0}% below passing ${passingScore}%`,
      "below_passing",
    );
  }

  return {
    id: enrollment.id as string,
    learner_id: enrollment.learner_id as string,
    course_id: enrollment.course_id as string,
    completed_at: enrollment.completed_at as string,
    final_score: finalScore,
    course: {
      title: course.title as string,
      industry: course.industry as string,
      passing_score: passingScore,
      status: course.status as string,
    },
  };
}

async function findExistingCredential(
  admin: SupabaseClient,
  learnerId: string,
  courseId: string,
) {
  const { data } = await admin
    .from("credentials")
    .select("id")
    .eq("learner_id", learnerId)
    .eq("course_id", courseId)
    .maybeSingle();
  return data?.id as string | undefined;
}

export async function issueCredentialForEnrollment(
  supabase: SupabaseClient,
  enrollmentId: string,
  learnerId: string,
): Promise<IssueResponse> {
  const enrollment = await loadEligibleEnrollment(
    supabase,
    enrollmentId,
    learnerId,
  );

  const serviceKey = serverEnv.supabaseServiceRoleKey;
  if (!serviceKey) {
    throw new IssueCredentialError(
      "Service role not configured",
      "service_unavailable",
    );
  }
  const admin = createAdminClient(serviceKey);

  const existingId = await findExistingCredential(
    admin,
    enrollment.learner_id,
    enrollment.course_id,
  );
  if (existingId) {
    throw new IssueCredentialError(
      "Credential already issued",
      "already_issued",
      existingId,
    );
  }

  const unsigned = buildUnsignedVc({
    learnerId: enrollment.learner_id,
    courseId: enrollment.course_id,
    courseTitle: enrollment.course.title,
    courseIndustry: enrollment.course.industry,
    finalScore: enrollment.final_score,
  });
  const signed = signVc(unsigned);
  const hash = credentialHashHex(stripProof(signed));

  let anchor: { network: "testnet" | "mock"; stellar_tx_hash: string | null };
  try {
    anchor = await anchorHash(hash);
  } catch {
    throw new IssueCredentialError("Stellar anchor failed", "anchor_failed");
  }

  const { data: row, error: insertError } = await admin
    .from("credentials")
    .insert({
      learner_id: enrollment.learner_id,
      course_id: enrollment.course_id,
      vc_jsonld: signed,
      credential_hash: hash,
      stellar_tx_hash: anchor.stellar_tx_hash,
      network: anchor.network,
    })
    .select("id")
    .single();

  if (insertError || !row) {
    if (insertError?.code === "23505") {
      const dupId = await findExistingCredential(
        admin,
        enrollment.learner_id,
        enrollment.course_id,
      );
      throw new IssueCredentialError(
        "Credential already issued",
        "already_issued",
        dupId,
      );
    }
    throw new IssueCredentialError(
      insertError?.message ?? "Insert failed",
      "service_unavailable",
    );
  }

  const credentialId = row.id as string;
  const verifyUrl = verifyUrlFor(credentialId);
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 256,
  });
  const qr_png_base64 = qrDataUrl.replace(/^data:image\/png;base64,/, "");

  console.info("[credential_issued]", {
    credential_id: credentialId,
    course_id: enrollment.course_id,
    network: anchor.network,
    anchored: Boolean(anchor.stellar_tx_hash),
  });

  return {
    credential_id: credentialId,
    verify_url: verifyUrl,
    qr_png_base64,
    network: anchor.network,
    stellar_tx_hash: anchor.stellar_tx_hash,
  };
}

export async function buildIssueResponseForExisting(
  credentialId: string,
  network: "testnet" | "mainnet" | "mock",
  stellarTxHash: string | null,
): Promise<IssueResponse> {
  const verifyUrl = verifyUrlFor(credentialId);
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 256,
  });
  return {
    credential_id: credentialId,
    verify_url: verifyUrl,
    qr_png_base64: qrDataUrl.replace(/^data:image\/png;base64,/, ""),
    network,
    stellar_tx_hash: stellarTxHash,
  };
}
