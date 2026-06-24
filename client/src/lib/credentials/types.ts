import { z } from "zod";

export const IssueRequestSchema = z.object({
  enrollment_id: z.string().uuid(),
});

export const IssueResponseSchema = z.object({
  credential_id: z.string().uuid(),
  verify_url: z.string().url(),
  qr_png_base64: z.string(),
  network: z.enum(["testnet", "mainnet", "mock"]),
  stellar_tx_hash: z.string().nullable(),
});

export type IssueResponse = z.infer<typeof IssueResponseSchema>;

export interface VcProof {
  type: string;
  created: string;
  verificationMethod: string;
  proofPurpose: string;
  proofValue: string;
}

export type VcDocument = Record<string, unknown> & {
  proof?: VcProof;
};

export interface BuildVcInput {
  learnerId: string;
  courseId: string;
  courseTitle: string;
  courseIndustry: string;
  finalScore: number;
  issuedAt?: string;
}
