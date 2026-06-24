import {
  Asset,
  Horizon,
  Keypair,
  Memo,
  Networks,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { credentialEnv } from "@/lib/credentials/issuer-config";
import { hashHexToBuffer } from "@/lib/credentials/canonicalize";

export interface AnchorResult {
  network: "testnet" | "mock";
  stellar_tx_hash: string | null;
}

const MAX_RETRIES = 3;

/** Anchor credential hash on Stellar Testnet, or mock when flag is off. */
export async function anchorHash(hashHex: string): Promise<AnchorResult> {
  if (!credentialEnv.onchainAnchor) {
    return { network: "mock", stellar_tx_hash: null };
  }

  const secret = credentialEnv.stellarAnchorSecret;
  if (!secret) {
    throw new Error("STELLAR_ANCHOR_SECRET required when ENABLE_ONCHAIN_ANCHOR=true");
  }

  const server = new Horizon.Server(credentialEnv.stellarHorizonUrl);
  const keypair = Keypair.fromSecret(secret);
  const hashBuffer = hashHexToBuffer(hashHex);

  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const account = await server.loadAccount(keypair.publicKey());
      const tx = new TransactionBuilder(account, {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination: keypair.publicKey(),
            asset: Asset.native(),
            amount: "0.0000001",
          }),
        )
        .addMemo(Memo.hash(hashBuffer))
        .setTimeout(60)
        .build();

      tx.sign(keypair);
      const result = await server.submitTransaction(tx);
      return { network: "testnet", stellar_tx_hash: result.hash };
    } catch (e) {
      lastError = e;
      await sleep(500 * 2 ** attempt);
    }
  }

  console.error("[anchor] Stellar submit failed after retries", lastError);
  throw new Error("stellar_anchor_failed");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Decode Horizon hash memo (base64) to lowercase hex. */
export function hashMemoToHex(memo: string): string | null {
  const buf = Buffer.from(memo, "base64");
  if (buf.length !== 32) return null;
  return buf.toString("hex");
}

/** Read hash memo from a submitted transaction via Horizon. */
export async function readAnchoredHash(
  stellarTxHash: string,
): Promise<string | null> {
  const server = new Horizon.Server(credentialEnv.stellarHorizonUrl);
  try {
    const tx = await server.transactions().transaction(stellarTxHash).call();
    if (tx.memo_type !== "hash" || !tx.memo) return null;
    return hashMemoToHex(tx.memo);
  } catch {
    return null;
  }
}
