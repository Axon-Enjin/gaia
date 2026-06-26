import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  Account,
  Asset,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import type { EligibleRecipient } from "./evaluate";
import {
  PAYOUT_DRILL_MAX_RECIPIENTS,
  PayoutDrillError,
  assertSignedTransactionMatchesPrepared,
  buildPreparedRecipients,
  normalizeDemoAmountXlm,
  validatePublicAddress,
  type PreparedPayoutRecipient,
} from "./payout-drill";

const funderAddress = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
const altFunderAddress = Keypair.random().publicKey();
const recipientAddress = Keypair.random().publicKey();

const recipients: EligibleRecipient[] = [
  {
    learner_id: "learner-1",
    display_name: "Maricel",
    total_xp: 400,
    badge_types: ["course_complete"],
    matched_industry: "agriculture",
  },
  {
    learner_id: "learner-2",
    display_name: "Ramon",
    total_xp: 350,
    badge_types: [],
    matched_industry: "agriculture",
  },
];

function makeTransaction(
  source: string,
  preparedRecipients: PreparedPayoutRecipient[],
): string {
  const account = new Account(source, "1");
  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: Networks.TESTNET,
  });

  for (const recipient of preparedRecipients) {
    if (!recipient.destinationAddress) continue;
    tx.addOperation(
      Operation.payment({
        destination: recipient.destinationAddress,
        asset: Asset.native(),
        amount: recipient.amountXlm,
      }),
    );
  }

  return tx.setTimeout(60).build().toXDR();
}

describe("normalizeDemoAmountXlm", () => {
  it("normalizes valid XLM amounts to 7 decimal places", () => {
    assert.equal(normalizeDemoAmountXlm("1.5"), "1.5000000");
    assert.equal(normalizeDemoAmountXlm("10"), "10.0000000");
  });

  it("rejects invalid payout amounts", () => {
    assert.throws(
      () => normalizeDemoAmountXlm("0"),
      (error: unknown) =>
        error instanceof PayoutDrillError && error.code === "invalid_amount",
    );
    assert.throws(
      () => normalizeDemoAmountXlm("1000.0000001"),
      (error: unknown) =>
        error instanceof PayoutDrillError && error.code === "invalid_amount",
    );
  });
});

describe("validatePublicAddress", () => {
  it("accepts valid Stellar public keys", () => {
    assert.equal(validatePublicAddress(funderAddress), funderAddress);
  });

  it("rejects invalid Stellar public keys", () => {
    assert.throws(
      () => validatePublicAddress("not-a-stellar-address"),
      (error: unknown) =>
        error instanceof PayoutDrillError && error.code === "invalid_address",
    );
  });
});

describe("buildPreparedRecipients", () => {
  it("includes only learners with saved valid testnet addresses", () => {
    const prepared = buildPreparedRecipients(
      recipients,
      new Map([
        [
          "learner-1",
          {
            id: "learner-1",
            display_name: "Maricel",
            payout_testnet_address: funderAddress,
          },
        ],
        [
          "learner-2",
          {
            id: "learner-2",
            display_name: "Ramon",
            payout_testnet_address: "invalid-address",
          },
        ],
      ]),
      "1.0000000",
    );

    assert.equal(prepared[0].included, true);
    assert.equal(prepared[0].destinationAddress, funderAddress);
    assert.equal(prepared[1].included, false);
    assert.equal(prepared[1].destinationAddress, null);
  });

  it("keeps the recipient cap constant decision visible to tests", () => {
    assert.equal(PAYOUT_DRILL_MAX_RECIPIENTS, 25);
  });
});

describe("assertSignedTransactionMatchesPrepared", () => {
  it("accepts a signed transaction that matches the prepared recipients", () => {
    const preparedRecipients: PreparedPayoutRecipient[] = [
      {
        learnerId: "learner-1",
        displayName: "Maricel",
        destinationAddress: recipientAddress,
        amountXlm: "1.2500000",
        included: true,
      },
    ];

    const xdr = makeTransaction(funderAddress, preparedRecipients);
    assert.doesNotThrow(() =>
      assertSignedTransactionMatchesPrepared(
        xdr,
        xdr,
        funderAddress,
        preparedRecipients,
      ),
    );
  });

  it("rejects a transaction signed by a different source address", () => {
    const preparedRecipients: PreparedPayoutRecipient[] = [
      {
        learnerId: "learner-1",
        displayName: "Maricel",
        destinationAddress: recipientAddress,
        amountXlm: "1.2500000",
        included: true,
      },
    ];

    const preparedXdr = makeTransaction(funderAddress, preparedRecipients);
    const mismatchedXdr = makeTransaction(altFunderAddress, preparedRecipients);

    assert.throws(
      () =>
        assertSignedTransactionMatchesPrepared(
          preparedXdr,
          mismatchedXdr,
          funderAddress,
          preparedRecipients,
        ),
      (error: unknown) =>
        error instanceof PayoutDrillError && error.code === "wallet_mismatch",
    );
  });

  it("rejects a transaction whose operations changed after prepare", () => {
    const preparedRecipients: PreparedPayoutRecipient[] = [
      {
        learnerId: "learner-1",
        displayName: "Maricel",
        destinationAddress: recipientAddress,
        amountXlm: "1.2500000",
        included: true,
      },
    ];

    const preparedXdr = makeTransaction(funderAddress, preparedRecipients);
    const tamperedXdr = makeTransaction(funderAddress, [
      {
        ...preparedRecipients[0],
        destinationAddress: altFunderAddress,
      },
    ]);

    assert.throws(
      () =>
        assertSignedTransactionMatchesPrepared(
          preparedXdr,
          tamperedXdr,
          funderAddress,
          preparedRecipients,
        ),
      (error: unknown) =>
        error instanceof PayoutDrillError && error.code === "invalid_transaction",
    );
  });
});
