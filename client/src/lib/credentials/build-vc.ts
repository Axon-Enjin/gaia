import type { BuildVcInput } from "@/lib/credentials/types";
import { credentialEnv } from "@/lib/credentials/issuer-config";

/** W3C VC + Open Badges 3.0 profile (unsigned document — proof added by sign.ts). */
export function buildUnsignedVc(input: BuildVcInput): Record<string, unknown> {
  const issued = input.issuedAt ?? new Date().toISOString();
  const learnerUrn = `urn:aniskwela:learner:${input.learnerId}`;
  const courseUrn = `urn:aniskwela:course:${input.courseId}`;

  return {
    "@context": [
      "https://www.w3.org/ns/credentials/v2",
      "https://purl.imsglobal.org/spec/ob/v3p0/context.json",
    ],
    type: ["VerifiableCredential", "OpenBadgeCredential"],
    issuer: {
      id: credentialEnv.issuerDid,
      type: ["Profile"],
      name: "Aniskwela",
    },
    validFrom: issued,
    credentialSubject: {
      id: learnerUrn,
      type: ["AchievementSubject"],
      achievement: {
        id: courseUrn,
        type: ["Achievement"],
        name: input.courseTitle,
        description: `${input.courseIndustry} course completed on Aniskwela`,
        creator: {
          id: credentialEnv.issuerDid,
          name: "Aniskwela",
        },
      },
      result: [
        {
          type: "Result",
          resultScore: String(input.finalScore),
          bestScore: "100",
          achievedLevel: "Pass",
        },
      ],
    },
  };
}
