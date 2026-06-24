import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";
import { anchorHash, hashMemoToHex } from "./anchor";

describe("anchorHash", () => {
  const prior = process.env.ENABLE_ONCHAIN_ANCHOR;

  after(() => {
    if (prior === undefined) delete process.env.ENABLE_ONCHAIN_ANCHOR;
    else process.env.ENABLE_ONCHAIN_ANCHOR = prior;
  });

  it("returns mock network when on-chain anchor disabled", async () => {
    process.env.ENABLE_ONCHAIN_ANCHOR = "false";
    const hash = "a".repeat(64);
    const result = await anchorHash(hash);
    assert.equal(result.network, "mock");
    assert.equal(result.stellar_tx_hash, null);
  });
});

describe("anchorHash with flag on", () => {
  before(() => {
    process.env.ENABLE_ONCHAIN_ANCHOR = "true";
    delete process.env.STELLAR_ANCHOR_SECRET;
  });

  after(() => {
    delete process.env.ENABLE_ONCHAIN_ANCHOR;
  });

  it("requires stellar secret when flag is on", async () => {
    await assert.rejects(
      () => anchorHash("b".repeat(64)),
      /STELLAR_ANCHOR_SECRET/,
    );
  });
});

describe("hashMemoToHex", () => {
  it("decodes Horizon base64 hash memos", () => {
    const hex = hashMemoToHex("eeqoMB3TpV1U1IUkKQSmijDQwLf/eJoGaVW6v/wS4xE=");
    assert.equal(hex, "79eaa8301dd3a55d54d485242904a68a30d0c0b7ff789a066955babffc12e311");
  });
});
