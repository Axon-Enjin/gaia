import { createHash } from "node:crypto";

/** Deterministic JSON serialization (sorted keys) for hashing. */
export function canonicalize(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(sortKeys);
  const obj = value as Record<string, unknown>;
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = sortKeys(obj[key]);
  }
  return sorted;
}

/** SHA-256 hex digest of canonical JSON (credential document without proof). */
export function credentialHashHex(vcDocument: unknown): string {
  const canonical = canonicalize(vcDocument);
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

export function hashHexToBuffer(hex: string): Buffer {
  const buf = Buffer.from(hex, "hex");
  if (buf.length !== 32) {
    throw new Error("credential hash must be 32 bytes");
  }
  return buf;
}
