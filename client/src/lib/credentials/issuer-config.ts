function required(name: string): string {
  const value = process.env[name];
  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function optional(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

/** Server-only credential + Stellar config. */
export const credentialEnv = {
  get issuerDid() {
    return required("VC_ISSUER_DID");
  },
  get issuerPrivateKeyPem() {
    return required("VC_ISSUER_PRIVATE_KEY").replace(/\\n/g, "\n");
  },
  get stellarAnchorSecret() {
    return optional("STELLAR_ANCHOR_SECRET");
  },
  get stellarHorizonUrl() {
    return optional("STELLAR_HORIZON_URL") ?? "https://horizon-testnet.stellar.org";
  },
  get appUrl() {
    return optional("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000";
  },
  get onchainAnchor() {
    return process.env.ENABLE_ONCHAIN_ANCHOR === "true";
  },
};

export function verifyUrlFor(credentialId: string): string {
  const base = credentialEnv.appUrl.replace(/\/$/, "");
  return `${base}/verify/${credentialId}`;
}
