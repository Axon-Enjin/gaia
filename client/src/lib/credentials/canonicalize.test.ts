import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canonicalize,
  credentialHashHex,
} from "./canonicalize";

describe("canonicalize", () => {
  it("sorts keys deterministically", () => {
    const a = canonicalize({ b: 1, a: 2 });
    const b = canonicalize({ a: 2, b: 1 });
    assert.equal(a, b);
  });

  it("produces stable credential hashes", () => {
    const doc = { type: ["VerifiableCredential"], issuer: { id: "did:test" } };
    const h1 = credentialHashHex(doc);
    const h2 = credentialHashHex({ issuer: { id: "did:test" }, type: ["VerifiableCredential"] });
    assert.equal(h1, h2);
    assert.match(h1, /^[a-f0-9]{64}$/);
  });
});
