/**
 * Centralized, server-side environment access.
 *
 * Public (NEXT_PUBLIC_*) values are safe in the browser; everything else is
 * server-only and must never be imported into a Client Component.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string): string | undefined {
  return process.env[name] || undefined;
}

/** Browser-safe Supabase config. */
export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

/** Server-only config — never expose to the client. */
export const serverEnv = {
  get supabaseServiceRoleKey() {
    return required("SUPABASE_SERVICE_ROLE_KEY");
  },
  azure: {
    get endpoint() {
      return required("AZURE_OPENAI_ENDPOINT");
    },
    apiVersion: process.env.AZURE_OPENAI_API_VERSION ?? "2026-05-01",
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT ?? "gaia-gpt-5.4",
    deploymentMini:
      process.env.AZURE_OPENAI_DEPLOYMENT_MINI ?? "gaia-gpt-5.4-mini",
    // Local-dev fallback only; prefer DefaultAzureCredential (Managed Identity).
    apiKey: optional("AZURE_OPENAI_API_KEY"),
  },
};

export const flags = {
  aiGeneration: process.env.ENABLE_AI_GENERATION === "true",
  onchainAnchor: process.env.ENABLE_ONCHAIN_ANCHOR === "true",
};
