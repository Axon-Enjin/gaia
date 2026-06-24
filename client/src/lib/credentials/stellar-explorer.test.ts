import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { stellarExplorerTxUrl } from "./stellar-explorer";

describe("stellarExplorerTxUrl", () => {
  const tx = "40d9a842ca846d1559367c846971e3bbd8647d313e1c52ac3aed29000e719ee3";

  it("builds testnet explorer URLs", () => {
    assert.equal(
      stellarExplorerTxUrl("testnet", tx),
      `https://stellar.expert/explorer/testnet/tx/${tx}`,
    );
  });

  it("builds mainnet explorer URLs", () => {
    assert.equal(
      stellarExplorerTxUrl("mainnet", tx),
      `https://stellar.expert/explorer/public/tx/${tx}`,
    );
  });

  it("returns null for mock network or missing hash", () => {
    assert.equal(stellarExplorerTxUrl("mock", tx), null);
    assert.equal(stellarExplorerTxUrl("testnet", null), null);
  });
});
