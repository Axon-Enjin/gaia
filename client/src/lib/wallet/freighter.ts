import { Networks } from "@stellar/stellar-sdk";

export type WalletConnectionState =
  | { status: "checking" }
  | { status: "not_installed" }
  | { status: "disconnected" }
  | { status: "connecting" }
  | {
      status: "connected";
      address: string;
      shortAddress: string;
      network: string;
      networkPassphrase: string;
    }
  | { status: "error"; code: WalletErrorCode };

export type WalletErrorCode =
  | "connection_failed"
  | "access_denied"
  | "address_failed"
  | "network_failed"
  | "sign_failed";

type FreighterResponse<T> = T & { error?: unknown };

export interface FreighterAdapter {
  isConnected: () => Promise<FreighterResponse<{ isConnected: boolean }>>;
  isAllowed: () => Promise<FreighterResponse<{ isAllowed: boolean }>>;
  requestAccess: () => Promise<FreighterResponse<{ address: string }>>;
  getAddress: () => Promise<FreighterResponse<{ address: string }>>;
  signTransaction: (
    transactionXdr: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
    },
  ) => Promise<FreighterResponse<{ signedTxXdr: string; signerAddress: string }>>;
  getNetworkDetails: () => Promise<
    FreighterResponse<{
      network: string;
      networkPassphrase: string;
      networkUrl: string;
      sorobanRpcUrl?: string;
    }>
  >;
}

async function loadFreighterApi() {
  return import("@stellar/freighter-api");
}

export const freighterAdapter: FreighterAdapter = {
  async isConnected() {
    const api = await loadFreighterApi();
    return api.isConnected();
  },
  async isAllowed() {
    const api = await loadFreighterApi();
    return api.isAllowed();
  },
  async requestAccess() {
    const api = await loadFreighterApi();
    return api.requestAccess();
  },
  async getAddress() {
    const api = await loadFreighterApi();
    return api.getAddress();
  },
  async signTransaction(transactionXdr, opts) {
    const api = await loadFreighterApi();
    return api.signTransaction(transactionXdr, opts);
  },
  async getNetworkDetails() {
    const api = await loadFreighterApi();
    return api.getNetworkDetails();
  },
};

export function shortenAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function isTestnetPassphrase(networkPassphrase: string): boolean {
  return networkPassphrase.trim() === Networks.TESTNET;
}

export function isTestnetWalletState(
  state: WalletConnectionState,
): state is Extract<WalletConnectionState, { status: "connected" }> {
  return (
    state.status === "connected" && isTestnetPassphrase(state.networkPassphrase)
  );
}

function hasError(value: { error?: unknown }): boolean {
  return value.error !== undefined && value.error !== null;
}

export async function readFreighterState(
  adapter: FreighterAdapter = freighterAdapter,
): Promise<WalletConnectionState> {
  const connected = await adapter.isConnected();
  if (hasError(connected) || !connected.isConnected) {
    return { status: "not_installed" };
  }

  const allowed = await adapter.isAllowed();
  if (hasError(allowed)) {
    return { status: "error", code: "connection_failed" };
  }
  if (!allowed.isAllowed) {
    return { status: "disconnected" };
  }

  return loadAuthorizedWallet(adapter);
}

export async function connectFreighter(
  adapter: FreighterAdapter = freighterAdapter,
): Promise<WalletConnectionState> {
  const connected = await adapter.isConnected();
  if (hasError(connected) || !connected.isConnected) {
    return { status: "not_installed" };
  }

  const access = await adapter.requestAccess();
  if (hasError(access)) {
    return { status: "error", code: "access_denied" };
  }

  return loadAuthorizedWallet(adapter, access.address);
}

export async function signFreighterTransaction(
  transactionXdr: string,
  opts?: {
    networkPassphrase?: string;
    address?: string;
  },
  adapter: FreighterAdapter = freighterAdapter,
): Promise<
  | { ok: true; signedTxXdr: string; signerAddress: string }
  | { ok: false; code: WalletErrorCode }
> {
  const result = await adapter.signTransaction(transactionXdr, opts);
  if (hasError(result) || !result.signedTxXdr.trim() || !result.signerAddress.trim()) {
    return { ok: false, code: "sign_failed" };
  }

  return {
    ok: true,
    signedTxXdr: result.signedTxXdr,
    signerAddress: result.signerAddress,
  };
}

async function loadAuthorizedWallet(
  adapter: FreighterAdapter,
  initialAddress?: string,
): Promise<WalletConnectionState> {
  const address = initialAddress
    ? { address: initialAddress }
    : await adapter.getAddress();

  if (hasError(address) || !address.address.trim()) {
    return { status: "error", code: "address_failed" };
  }

  const network = await adapter.getNetworkDetails();
  if (hasError(network) || !network.network.trim()) {
    return { status: "error", code: "network_failed" };
  }

  return {
    status: "connected",
    address: address.address,
    shortAddress: shortenAddress(address.address),
    network: network.network,
    networkPassphrase: network.networkPassphrase,
  };
}
