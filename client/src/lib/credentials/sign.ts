import {
  createPrivateKey,
  createPublicKey,
  sign,
  verify,
} from "node:crypto";
import { canonicalize } from "@/lib/credentials/canonicalize";
import { credentialEnv } from "@/lib/credentials/issuer-config";
import type { VcDocument, VcProof } from "@/lib/credentials/types";

function issuerPrivateKey() {
  return createPrivateKey(credentialEnv.issuerPrivateKeyPem);
}

export function stripProof(vc: VcDocument): Record<string, unknown> {
  const { proof: _proof, ...rest } = vc;
  return rest;
}

export function signVc(unsigned: Record<string, unknown>): VcDocument {
  const canonical = canonicalize(unsigned);
  const key = issuerPrivateKey();
  const signature = sign(null, Buffer.from(canonical, "utf8"), key);
  const proof: VcProof = {
    type: "Ed25519Signature2020",
    created: new Date().toISOString(),
    verificationMethod: `${credentialEnv.issuerDid}#key-1`,
    proofPurpose: "assertionMethod",
    proofValue: signature.toString("base64url"),
  };
  return { ...unsigned, proof };
}

export function verifyVcSignature(vc: VcDocument): boolean {
  const proof = vc.proof;
  if (!proof?.proofValue) return false;
  try {
    const unsigned = stripProof(vc);
    const canonical = canonicalize(unsigned);
    const pub = createPublicKey(issuerPrivateKey());
    return verify(
      null,
      Buffer.from(canonical, "utf8"),
      pub,
      Buffer.from(proof.proofValue, "base64url"),
    );
  } catch {
    return false;
  }
}
