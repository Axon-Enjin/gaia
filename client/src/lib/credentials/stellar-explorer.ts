/** Stellar Expert deep link for a credential anchor transaction. */
export function stellarExplorerTxUrl(
  network: string,
  stellarTxHash: string | null | undefined,
): string | null {
  const hash = stellarTxHash?.trim();
  if (!hash) return null;

  if (network === "testnet") {
    return `https://stellar.expert/explorer/testnet/tx/${hash}`;
  }
  if (network === "mainnet" || network === "public") {
    return `https://stellar.expert/explorer/public/tx/${hash}`;
  }
  return null;
}
