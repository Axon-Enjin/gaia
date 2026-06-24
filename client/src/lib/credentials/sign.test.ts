import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";
import { generateKeyPairSync } from "node:crypto";
import { signVc, stripProof, verifyVcSignature } from "./sign";
import { buildUnsignedVc } from "./build-vc";
import { credentialHashHex } from "./canonicalize";

const { privateKey } = generateKeyPairSync("ed25519", {
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

describe("signVc", () => {
  before(() => {
    process.env.VC_ISSUER_DID = "did:key:test";
    process.env.VC_ISSUER_PRIVATE_KEY = privateKey.replace(/\n/g, "\\n");
  });

  after(() => {
    delete process.env.VC_ISSUER_DID;
    delete process.env.VC_ISSUER_PRIVATE_KEY;
  });

  it("signs and verifies a credential", () => {
    const unsigned = buildUnsignedVc({
      learnerId: "11111111-1111-4111-8111-111111111111",
      courseId: "22222222-2222-4222-8222-222222222222",
      courseTitle: "Test Course",
      courseIndustry: "agriculture",
      finalScore: 85,
      issuedAt: "2026-01-01T00:00:00.000Z",
    });
    const signed = signVc(unsigned);
    assert.ok(signed.proof?.proofValue);
    assert.equal(verifyVcSignature(signed), true);
  });

  it("detects tampered credentials", () => {
    const unsigned = buildUnsignedVc({
      learnerId: "11111111-1111-4111-8111-111111111111",
      courseId: "22222222-2222-4222-8222-222222222222",
      courseTitle: "Test Course",
      courseIndustry: "agriculture",
      finalScore: 85,
    });
    const signed = signVc(unsigned);
    const tampered = {
      ...signed,
      credentialSubject: {
        ...(signed.credentialSubject as object),
        id: "urn:aniskwela:learner:evil",
      },
    };
    assert.equal(verifyVcSignature(tampered), false);
  });

  it("hash is stable for unsigned body", () => {
    const unsigned = buildUnsignedVc({
      learnerId: "11111111-1111-4111-8111-111111111111",
      courseId: "22222222-2222-4222-8222-222222222222",
      courseTitle: "Test Course",
      courseIndustry: "agriculture",
      finalScore: 85,
    });
    const signed = signVc(unsigned);
    const h1 = credentialHashHex(stripProof(signed));
    const h2 = credentialHashHex(stripProof(signed));
    assert.equal(h1, h2);
  });
});
