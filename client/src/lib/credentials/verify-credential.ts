import type { SupabaseClient } from "@supabase/supabase-js";
import { readAnchoredHash } from "@/lib/credentials/anchor";
import { credentialHashHex } from "@/lib/credentials/canonicalize";
import { stripProof, verifyVcSignature } from "@/lib/credentials/sign";
import type { VcDocument } from "@/lib/credentials/types";

export interface VerifyRow {
  id: string;
  vc_jsonld: VcDocument;
  credential_hash: string;
  stellar_tx_hash: string | null;
  network: string;
  issued_at: string;
  course_title: string;
  course_industry: string;
  learner_display: string;
  final_score: number | null;
}

export interface VerifyResult {
  valid: boolean;
  checks: { signature: boolean; hash_on_chain: boolean | null };
  course: string;
  learner: string;
  issued_at: string;
  score: number | null;
  network: string;
  stellar_tx_hash: string | null;
  mock_anchor: boolean;
}

export async function loadCredentialForVerify(
  supabase: SupabaseClient,
  credentialId: string,
): Promise<VerifyRow | null> {
  const { data, error } = await supabase.rpc("get_credential_for_verify", {
    p_credential_id: credentialId,
  });

  if (error || !data || !Array.isArray(data) || data.length === 0) {
    return null;
  }

  const row = data[0] as Record<string, unknown>;
  return {
    id: row.id as string,
    vc_jsonld: row.vc_jsonld as VcDocument,
    credential_hash: row.credential_hash as string,
    stellar_tx_hash: (row.stellar_tx_hash as string | null) ?? null,
    network: row.network as string,
    issued_at: row.issued_at as string,
    course_title: row.course_title as string,
    course_industry: row.course_industry as string,
    learner_display: row.learner_display as string,
    final_score: (row.final_score as number | null) ?? null,
  };
}

export async function verifyCredentialRecord(
  row: VerifyRow,
): Promise<VerifyResult> {
  const vc = row.vc_jsonld;
  const signatureOk = verifyVcSignature(vc);
  const recomputed = credentialHashHex(stripProof(vc));
  const hashMatchesStored = recomputed === row.credential_hash;

  let hashOnChain: boolean | null = null;
  const isMock = row.network === "mock";

  if (isMock) {
    hashOnChain = null;
  } else if (row.stellar_tx_hash) {
    const onChain = await readAnchoredHash(row.stellar_tx_hash);
    hashOnChain = onChain === row.credential_hash;
  } else {
    hashOnChain = false;
  }

  const valid =
    signatureOk &&
    hashMatchesStored &&
    (isMock ? true : hashOnChain === true);

  return {
    valid,
    checks: {
      signature: signatureOk && hashMatchesStored,
      hash_on_chain: hashOnChain,
    },
    course: row.course_title,
    learner: row.learner_display,
    issued_at: row.issued_at,
    score: row.final_score,
    network: row.network,
    stellar_tx_hash: row.stellar_tx_hash,
    mock_anchor: isMock,
  };
}
