import type { SupabaseClient } from "@supabase/supabase-js";
import {
  Asset,
  Horizon,
  Networks,
  Operation,
  StrKey,
  Transaction,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { credentialEnv } from "@/lib/credentials/issuer-config";
import type { EligibleRecipient } from "@/lib/grants/evaluate";

const STROOPS_PER_XLM = BigInt(10_000_000);
export const PAYOUT_DRILL_MAX_RECIPIENTS = 25;
const MAX_DEMO_AMOUNT_STROOPS = BigInt(1_000) * STROOPS_PER_XLM;

export type PayoutDrillStatus = "prepared" | "signed" | "submitted" | "failed";

export interface PreparedPayoutRecipient {
  learnerId: string;
  displayName: string | null;
  destinationAddress: string | null;
  amountXlm: string;
  included: boolean;
}

export interface PreparedPayoutDrill {
  drillId: string;
  programId: string;
  sourceDisbursementId: string;
  network: "testnet";
  funderAddress: string;
  demoAmountXlm: string;
  totalAmountXlm: string;
  recipientCount: number;
  transactionXdr: string;
  recipients: PreparedPayoutRecipient[];
}

export interface SubmitPayoutDrillResult {
  drillId: string;
  txHash: string;
  submittedAt: string;
  recipientCount: number;
  totalAmountXlm: string;
  network: "testnet";
}

export interface PayoutDrillReadiness {
  available: boolean;
  latestDisbursementId: string | null;
  latestDisbursementCreatedAt: string | null;
  latestSimulationRecipientCount: number;
  recipientsWithWallets: number;
  recipientsMissingWallets: number;
  latestDrill: {
    id: string;
    status: PayoutDrillStatus;
    txHash: string | null;
    createdAt: string;
    recipientCount: number;
    totalAmountXlm: string;
  } | null;
  errorCode?: "service_unavailable" | "not_found" | "query_failed";
}

interface LatestDisbursementSnapshot {
  id: string;
  programId: string;
  funderId: string;
  createdAt: string;
  recipientCount: number;
  recipients: EligibleRecipient[];
}

interface DrillRecipientRow {
  destination_address: unknown;
  amount_xlm: unknown;
  included: unknown;
  learner_id: unknown;
}

interface DrillRow {
  id: unknown;
  created_at: unknown;
  status: unknown;
  tx_hash: unknown;
  recipient_count: unknown;
  total_amount_xlm: unknown;
}

interface ProfileWalletRow {
  id: string;
  display_name: string | null;
  payout_testnet_address: string | null;
}

export class PayoutDrillError extends Error {
  constructor(
    message: string,
    public code:
      | "service_unavailable"
      | "invalid_address"
      | "invalid_amount"
      | "invalid_network"
      | "no_simulation"
      | "stale_simulation"
      | "recipient_cap_exceeded"
      | "no_recipients"
      | "drill_not_found"
      | "wallet_mismatch"
      | "already_submitted"
      | "invalid_transaction"
      | "horizon_submit_failed",
  ) {
    super(message);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function parseEligibleRecipients(value: unknown): EligibleRecipient[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (!isRecord(entry)) return null;
      const learnerId = entry.learner_id;
      const totalXp = entry.total_xp;
      const badgeTypes = entry.badge_types;
      const matchedIndustry = entry.matched_industry;
      if (
        typeof learnerId !== "string" ||
        typeof totalXp !== "number" ||
        !Array.isArray(badgeTypes) ||
        typeof matchedIndustry !== "string"
      ) {
        return null;
      }

      return {
        learner_id: learnerId,
        display_name:
          typeof entry.display_name === "string" ? entry.display_name : null,
        total_xp: totalXp,
        badge_types: badgeTypes.filter(
          (badge): badge is string => typeof badge === "string",
        ),
        matched_industry: matchedIndustry,
      } satisfies EligibleRecipient;
    })
    .filter((entry): entry is EligibleRecipient => entry !== null);
}

function amountToStroops(input: string): bigint {
  const normalized = input.trim();
  if (!/^\d+(?:\.\d{1,7})?$/.test(normalized)) {
    throw new PayoutDrillError("Invalid XLM amount", "invalid_amount");
  }

  const [whole, fraction = ""] = normalized.split(".");
  const stroops =
    BigInt(whole) * STROOPS_PER_XLM +
    BigInt((fraction + "0000000").slice(0, 7));

  if (stroops <= BigInt(0) || stroops > MAX_DEMO_AMOUNT_STROOPS) {
    throw new PayoutDrillError("XLM amount out of range", "invalid_amount");
  }

  return stroops;
}

function stroopsToAmount(stroops: bigint): string {
  const whole = stroops / STROOPS_PER_XLM;
  const fraction = (stroops % STROOPS_PER_XLM).toString().padStart(7, "0");
  return `${whole}.${fraction}`;
}

export function normalizeDemoAmountXlm(input: string): string {
  return stroopsToAmount(amountToStroops(input));
}

export function validatePublicAddress(address: string): string {
  const normalized = address.trim();
  if (!StrKey.isValidEd25519PublicKey(normalized)) {
    throw new PayoutDrillError("Invalid Stellar address", "invalid_address");
  }
  return normalized;
}

function toProfileWalletRows(rows: unknown[]): Map<string, ProfileWalletRow> {
  const result = new Map<string, ProfileWalletRow>();
  for (const row of rows) {
    if (!isRecord(row)) continue;
    if (typeof row.id !== "string") continue;
    result.set(row.id, {
      id: row.id,
      display_name: typeof row.display_name === "string" ? row.display_name : null,
      payout_testnet_address:
        typeof row.payout_testnet_address === "string"
          ? row.payout_testnet_address
          : null,
    });
  }
  return result;
}

export function buildPreparedRecipients(
  recipients: EligibleRecipient[],
  profileWallets: Map<string, ProfileWalletRow>,
  demoAmountXlm: string,
): PreparedPayoutRecipient[] {
  return recipients.map((recipient) => {
    const profile = profileWallets.get(recipient.learner_id);
    const rawDestination = profile?.payout_testnet_address?.trim() ?? null;
    let destination: string | null = null;
    if (rawDestination) {
      try {
        destination = validatePublicAddress(rawDestination);
      } catch {
        destination = null;
      }
    }

    return {
      learnerId: recipient.learner_id,
      displayName: profile?.display_name ?? recipient.display_name ?? null,
      destinationAddress: destination || null,
      amountXlm: demoAmountXlm,
      included: Boolean(destination),
    };
  });
}

function includedRecipients(
  recipients: PreparedPayoutRecipient[],
): PreparedPayoutRecipient[] {
  return recipients.filter(
    (recipient): recipient is PreparedPayoutRecipient & { destinationAddress: string } =>
      recipient.included && typeof recipient.destinationAddress === "string",
  );
}

async function buildUnsignedPaymentXdr(
  funderAddress: string,
  recipients: PreparedPayoutRecipient[],
): Promise<string> {
  const server = new Horizon.Server(credentialEnv.stellarHorizonUrl);
  const account = await server.loadAccount(funderAddress);
  const baseFee = await server.fetchBaseFee();

  const builder = new TransactionBuilder(account, {
    fee: String(baseFee),
    networkPassphrase: Networks.TESTNET,
  });

  for (const recipient of recipients) {
    builder.addOperation(
      Operation.payment({
        destination: recipient.destinationAddress!,
        asset: Asset.native(),
        amount: recipient.amountXlm,
      }),
    );
  }

  return builder.setTimeout(60).build().toXDR();
}

function parsePaymentTransaction(xdr: string): Transaction {
  try {
    const parsed = TransactionBuilder.fromXDR(xdr, Networks.TESTNET);
    if (!(parsed instanceof Transaction)) {
      throw new Error("fee_bump_not_supported");
    }
    return parsed;
  } catch {
    throw new PayoutDrillError("Invalid transaction XDR", "invalid_transaction");
  }
}

export function assertSignedTransactionMatchesPrepared(
  preparedXdr: string,
  signedXdr: string,
  funderAddress: string,
  recipients: PreparedPayoutRecipient[],
): void {
  const prepared = parsePaymentTransaction(preparedXdr);
  const signed = parsePaymentTransaction(signedXdr);

  if (prepared.source !== signed.source || signed.source !== funderAddress) {
    throw new PayoutDrillError("Funder wallet mismatch", "wallet_mismatch");
  }

  if (prepared.operations.length !== signed.operations.length) {
    throw new PayoutDrillError("Signed transaction does not match prepared transaction", "invalid_transaction");
  }

  const expected = includedRecipients(recipients);
  if (expected.length !== signed.operations.length) {
    throw new PayoutDrillError("Signed transaction recipient count mismatch", "invalid_transaction");
  }

  signed.operations.forEach((operation, index) => {
    const recipient = expected[index];
    if (operation.type !== "payment") {
      throw new PayoutDrillError("Unexpected operation in signed transaction", "invalid_transaction");
    }
    if (
      operation.destination !== recipient.destinationAddress ||
      operation.amount !== recipient.amountXlm
    ) {
      throw new PayoutDrillError("Signed transaction payload mismatch", "invalid_transaction");
    }
  });
}

async function getLatestDisbursementSnapshot(
  admin: SupabaseClient,
  funderId: string,
  programId: string,
): Promise<LatestDisbursementSnapshot | null> {
  const { data, error } = await admin
    .from("grant_disbursements")
    .select("id, program_id, funder_id, created_at, recipient_count, recipients")
    .eq("funder_id", funderId)
    .eq("program_id", programId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data || !isRecord(data)) return null;

  return {
    id: data.id as string,
    programId: data.program_id as string,
    funderId: data.funder_id as string,
    createdAt: data.created_at as string,
    recipientCount: Number(data.recipient_count ?? 0),
    recipients: parseEligibleRecipients(data.recipients),
  };
}

async function loadProfileWallets(
  admin: SupabaseClient,
  learnerIds: string[],
): Promise<Map<string, ProfileWalletRow>> {
  if (learnerIds.length === 0) return new Map();

  const { data, error } = await admin
    .from("profiles")
    .select("id, display_name, payout_testnet_address")
    .in("id", learnerIds);

  if (error) throw error;
  return toProfileWalletRows((data ?? []) as unknown[]);
}

function toReadinessLatestDrill(row: DrillRow | null): PayoutDrillReadiness["latestDrill"] {
  if (!row || typeof row.id !== "string" || typeof row.created_at !== "string") {
    return null;
  }

  return {
    id: row.id,
    status: (row.status as PayoutDrillStatus) ?? "prepared",
    txHash: typeof row.tx_hash === "string" ? row.tx_hash : null,
    createdAt: row.created_at,
    recipientCount: Number(row.recipient_count ?? 0),
    totalAmountXlm:
      row.total_amount_xlm !== null && row.total_amount_xlm !== undefined
        ? normalizeDemoAmountXlm(String(row.total_amount_xlm))
        : "0.0000000",
  };
}

export async function getPayoutDrillReadiness(
  admin: SupabaseClient,
  funderId: string,
  programId: string,
): Promise<PayoutDrillReadiness> {
  try {
    const latestDisbursement = await getLatestDisbursementSnapshot(admin, funderId, programId);

    const { data: latestDrillRows, error: drillError } = await admin
      .from("grant_payout_drills")
      .select("id, created_at, status, tx_hash, recipient_count, total_amount_xlm")
      .eq("funder_id", funderId)
      .eq("program_id", programId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (drillError) throw drillError;

    if (!latestDisbursement) {
      return {
        available: true,
        latestDisbursementId: null,
        latestDisbursementCreatedAt: null,
        latestSimulationRecipientCount: 0,
        recipientsWithWallets: 0,
        recipientsMissingWallets: 0,
        latestDrill: toReadinessLatestDrill(
          ((latestDrillRows ?? [])[0] as DrillRow | undefined) ?? null,
        ),
      };
    }

    const wallets = await loadProfileWallets(
      admin,
      latestDisbursement.recipients.map((recipient) => recipient.learner_id),
    );
    const recipients = buildPreparedRecipients(
      latestDisbursement.recipients,
      wallets,
      "1.0000000",
    );
    const included = includedRecipients(recipients).length;

    return {
      available: true,
      latestDisbursementId: latestDisbursement.id,
      latestDisbursementCreatedAt: latestDisbursement.createdAt,
      latestSimulationRecipientCount: latestDisbursement.recipientCount,
      recipientsWithWallets: included,
      recipientsMissingWallets: recipients.length - included,
      latestDrill: toReadinessLatestDrill(
        ((latestDrillRows ?? [])[0] as DrillRow | undefined) ?? null,
      ),
    };
  } catch {
    return {
      available: false,
      latestDisbursementId: null,
      latestDisbursementCreatedAt: null,
      latestSimulationRecipientCount: 0,
      recipientsWithWallets: 0,
      recipientsMissingWallets: 0,
      latestDrill: null,
      errorCode: "query_failed",
    };
  }
}

export async function preparePayoutDrill(
  admin: SupabaseClient,
  input: {
    funderId: string;
    programId: string;
    sourceDisbursementId: string;
    funderAddress: string;
    demoAmountXlm: string;
  },
): Promise<PreparedPayoutDrill> {
  const latest = await getLatestDisbursementSnapshot(
    admin,
    input.funderId,
    input.programId,
  );
  if (!latest) {
    throw new PayoutDrillError("Latest simulation not found", "no_simulation");
  }
  if (latest.id !== input.sourceDisbursementId) {
    throw new PayoutDrillError("Latest simulation has changed", "stale_simulation");
  }

  const funderAddress = validatePublicAddress(input.funderAddress);
  const demoAmountXlm = normalizeDemoAmountXlm(input.demoAmountXlm);
  const wallets = await loadProfileWallets(
    admin,
    latest.recipients.map((recipient) => recipient.learner_id),
  );
  const recipients = buildPreparedRecipients(latest.recipients, wallets, demoAmountXlm);
  const included = includedRecipients(recipients);

  if (included.length === 0) {
    throw new PayoutDrillError("No recipients with saved testnet wallets", "no_recipients");
  }
  if (included.length > PAYOUT_DRILL_MAX_RECIPIENTS) {
    throw new PayoutDrillError("Recipient cap exceeded", "recipient_cap_exceeded");
  }

  const totalAmountXlm = stroopsToAmount(
    amountToStroops(demoAmountXlm) * BigInt(included.length),
  );
  const preparedXdr = await buildUnsignedPaymentXdr(funderAddress, included);

  const { data: drillRow, error: drillError } = await admin
    .from("grant_payout_drills")
    .insert({
      program_id: input.programId,
      funder_id: input.funderId,
      source_disbursement_id: latest.id,
      network: "testnet",
      funder_address: funderAddress,
      prepared_xdr: preparedXdr,
      demo_amount_xlm: demoAmountXlm,
      recipient_count: included.length,
      total_amount_xlm: totalAmountXlm,
      status: "prepared",
    })
    .select("id")
    .single();

  if (drillError || !drillRow || !isRecord(drillRow) || typeof drillRow.id !== "string") {
    throw new PayoutDrillError("Could not create payout drill", "service_unavailable");
  }

  const recipientRows = recipients.map((recipient) => ({
    drill_id: drillRow.id,
    learner_id: recipient.learnerId,
    destination_address: recipient.destinationAddress,
    amount_xlm: recipient.amountXlm,
    included: recipient.included,
  }));

  const { error: recipientsError } = await admin
    .from("grant_payout_drill_recipients")
    .insert(recipientRows);

  if (recipientsError) {
    throw new PayoutDrillError("Could not create payout drill recipients", "service_unavailable");
  }

  return {
    drillId: drillRow.id,
    programId: input.programId,
    sourceDisbursementId: latest.id,
    network: "testnet",
    funderAddress,
    demoAmountXlm,
    totalAmountXlm,
    recipientCount: included.length,
    transactionXdr: preparedXdr,
    recipients,
  };
}

async function loadDrill(
  admin: SupabaseClient,
  funderId: string,
  drillId: string,
): Promise<{
  id: string;
  funderAddress: string;
  preparedXdr: string;
  recipientCount: number;
  totalAmountXlm: string;
  status: PayoutDrillStatus;
  recipients: PreparedPayoutRecipient[];
} | null> {
  const { data: drillRow, error: drillError } = await admin
    .from("grant_payout_drills")
    .select("id, funder_address, prepared_xdr, recipient_count, total_amount_xlm, status")
    .eq("id", drillId)
    .eq("funder_id", funderId)
    .maybeSingle();

  if (drillError) throw drillError;
  if (!drillRow || !isRecord(drillRow)) return null;

  const { data: recipientRows, error: recipientsError } = await admin
    .from("grant_payout_drill_recipients")
    .select("learner_id, destination_address, amount_xlm, included")
    .eq("drill_id", drillId)
    .order("created_at", { ascending: true });

  if (recipientsError) throw recipientsError;

  const recipients: PreparedPayoutRecipient[] = ((recipientRows ?? []) as DrillRecipientRow[])
    .map((row) => ({
      learnerId: typeof row.learner_id === "string" ? row.learner_id : "",
      displayName: null,
      destinationAddress:
        typeof row.destination_address === "string" ? row.destination_address : null,
      amountXlm:
        row.amount_xlm !== null && row.amount_xlm !== undefined
          ? normalizeDemoAmountXlm(String(row.amount_xlm))
          : "0.0000000",
      included: Boolean(row.included),
    }))
    .filter((row) => row.learnerId);

  return {
    id: drillRow.id as string,
    funderAddress: validatePublicAddress(String(drillRow.funder_address)),
    preparedXdr: String(drillRow.prepared_xdr),
    recipientCount: Number(drillRow.recipient_count ?? 0),
    totalAmountXlm: normalizeDemoAmountXlm(String(drillRow.total_amount_xlm)),
    status: (drillRow.status as PayoutDrillStatus) ?? "prepared",
    recipients,
  };
}

export async function submitPayoutDrill(
  admin: SupabaseClient,
  input: {
    funderId: string;
    drillId: string;
    signedXdr: string;
    signerAddress: string;
  },
): Promise<SubmitPayoutDrillResult> {
  const drill = await loadDrill(admin, input.funderId, input.drillId);
  if (!drill) {
    throw new PayoutDrillError("Payout drill not found", "drill_not_found");
  }
  if (drill.status === "submitted") {
    throw new PayoutDrillError("Payout drill already submitted", "already_submitted");
  }

  const signerAddress = validatePublicAddress(input.signerAddress);
  if (signerAddress !== drill.funderAddress) {
    throw new PayoutDrillError("Freighter signer mismatch", "wallet_mismatch");
  }

  assertSignedTransactionMatchesPrepared(
    drill.preparedXdr,
    input.signedXdr,
    drill.funderAddress,
    drill.recipients,
  );

  const server = new Horizon.Server(credentialEnv.stellarHorizonUrl);
  const signedTransaction = parsePaymentTransaction(input.signedXdr);

  await admin
    .from("grant_payout_drills")
    .update({
      status: "signed",
      signed_xdr: input.signedXdr,
    })
    .eq("id", drill.id)
    .eq("funder_id", input.funderId);

  try {
    const result = await server.submitTransaction(signedTransaction);
    const submittedAt = new Date().toISOString();

    const { error } = await admin
      .from("grant_payout_drills")
      .update({
        status: "submitted",
        tx_hash: result.hash,
        signed_xdr: input.signedXdr,
        submitted_at: submittedAt,
        failure_code: null,
      })
      .eq("id", drill.id)
      .eq("funder_id", input.funderId);

    if (error) {
      throw new PayoutDrillError("Could not persist payout drill submission", "service_unavailable");
    }

    return {
      drillId: drill.id,
      txHash: result.hash,
      submittedAt,
      recipientCount: drill.recipientCount,
      totalAmountXlm: drill.totalAmountXlm,
      network: "testnet",
    };
  } catch (error) {
    await admin
      .from("grant_payout_drills")
      .update({
        status: "failed",
        signed_xdr: input.signedXdr,
        failure_code: error instanceof Error ? error.message : "submit_failed",
      })
      .eq("id", drill.id)
      .eq("funder_id", input.funderId);

    throw new PayoutDrillError("Horizon submit failed", "horizon_submit_failed");
  }
}
