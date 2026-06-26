import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  connectFreighter,
  isTestnetPassphrase,
  isTestnetWalletState,
  readFreighterState,
  signFreighterTransaction,
  shortenAddress,
  type FreighterAdapter,
} from "./freighter";

function adapter(
  overrides: Partial<FreighterAdapter>,
): FreighterAdapter {
  return {
    isConnected: async () => ({ isConnected: true }),
    isAllowed: async () => ({ isAllowed: true }),
    requestAccess: async () => ({ address: "GABCDEFGH1234567890XYZ" }),
    getAddress: async () => ({ address: "GABCDEFGH1234567890XYZ" }),
    signTransaction: async () => ({
      signedTxXdr: "signed-xdr",
      signerAddress: "GABCDEFGH1234567890XYZ",
    }),
    getNetworkDetails: async () => ({
      network: "TESTNET",
      networkPassphrase: "Test SDF Network ; September 2015",
      networkUrl: "https://horizon-testnet.stellar.org",
    }),
    ...overrides,
  };
}

describe("shortenAddress", () => {
  it("shortens long wallet addresses", () => {
    assert.equal(shortenAddress("GABCDEFGH1234567890XYZ"), "GABCDE...0XYZ");
  });
});

describe("readFreighterState", () => {
  it("returns not_installed when the extension is unavailable", async () => {
    const result = await readFreighterState(
      adapter({ isConnected: async () => ({ isConnected: false }) }),
    );
    assert.deepEqual(result, { status: "not_installed" });
  });

  it("returns disconnected when installed but not authorized", async () => {
    const result = await readFreighterState(
      adapter({ isAllowed: async () => ({ isAllowed: false }) }),
    );
    assert.deepEqual(result, { status: "disconnected" });
  });

  it("returns connected when address and network load cleanly", async () => {
    const result = await readFreighterState(adapter({}));
    assert.deepEqual(result, {
      status: "connected",
      address: "GABCDEFGH1234567890XYZ",
      shortAddress: "GABCDE...0XYZ",
      network: "TESTNET",
      networkPassphrase: "Test SDF Network ; September 2015",
    });
  });
});

describe("connectFreighter", () => {
  it("returns access_denied when access request fails", async () => {
    const result = await connectFreighter(
      adapter({ requestAccess: async () => ({ address: "", error: "denied" }) }),
    );
    assert.deepEqual(result, { status: "error", code: "access_denied" });
  });

  it("returns network_failed when network lookup fails after connect", async () => {
    const result = await connectFreighter(
      adapter({
        getNetworkDetails: async () => ({
          network: "",
          networkPassphrase: "",
          networkUrl: "",
          error: "failed",
        }),
      }),
    );
    assert.deepEqual(result, { status: "error", code: "network_failed" });
  });
});

describe("isTestnet helpers", () => {
  it("recognizes the Stellar testnet passphrase", () => {
    assert.equal(isTestnetPassphrase("Test SDF Network ; September 2015"), true);
    assert.equal(isTestnetPassphrase("Public Global Stellar Network ; September 2015"), false);
  });

  it("recognizes connected testnet wallet state", () => {
    assert.equal(
      isTestnetWalletState({
        status: "connected",
        address: "GABCDEFGH1234567890XYZ",
        shortAddress: "GABCDE...0XYZ",
        network: "TESTNET",
        networkPassphrase: "Test SDF Network ; September 2015",
      }),
      true,
    );
  });
});

describe("signFreighterTransaction", () => {
  it("returns signed xdr and signer address on success", async () => {
    const result = await signFreighterTransaction("unsigned-xdr", {}, adapter({}));
    assert.deepEqual(result, {
      ok: true,
      signedTxXdr: "signed-xdr",
      signerAddress: "GABCDEFGH1234567890XYZ",
    });
  });

  it("returns sign_failed when Freighter rejects signing", async () => {
    const result = await signFreighterTransaction(
      "unsigned-xdr",
      {},
      adapter({
        signTransaction: async () => ({
          signedTxXdr: "",
          signerAddress: "",
          error: "denied",
        }),
      }),
    );
    assert.deepEqual(result, { ok: false, code: "sign_failed" });
  });
});
