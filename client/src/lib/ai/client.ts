import OpenAI, { AzureOpenAI } from "openai";
import {
  DefaultAzureCredential,
  getBearerTokenProvider,
} from "@azure/identity";
import { serverEnv } from "@/lib/env";

/**
 * Azure AI Foundry clients (AGENTS.md §3). One client per deployment.
 *
 * Auth: DefaultAzureCredential (Managed Identity) is preferred. An API key is a
 * LOCAL-DEV fallback only — set AZURE_OPENAI_API_KEY to use it. Never commit it.
 *
 * Foundry project resources expose an OpenAI-compatible `/openai/v1` base URL when
 * using an API key. Classic `AzureOpenAI` + deployment is used with AAD in prod.
 *
 * Server-only module: importing this into a Client Component will leak nothing
 * (env reads throw), but it must stay on the server regardless.
 */

const COGNITIVE_SCOPE = "https://cognitiveservices.azure.com/.default";

/** Chat client — OpenAI (Foundry v1 + API key) or AzureOpenAI (AAD). */
export type AiChatClient = OpenAI | AzureOpenAI;

function foundryV1BaseUrl(endpoint: string): string {
  const trimmed = endpoint.replace(/\/$/, "");
  if (trimmed.endsWith("/openai/v1")) return trimmed;
  return `${trimmed}/openai/v1`;
}

function buildClient(deployment: string): AiChatClient {
  const { endpoint, apiVersion, apiKey } = serverEnv.azure;

  if (apiKey) {
    return new OpenAI({
      baseURL: foundryV1BaseUrl(endpoint),
      apiKey,
    });
  }

  const credential = new DefaultAzureCredential();
  const azureADTokenProvider = getBearerTokenProvider(
    credential,
    COGNITIVE_SCOPE,
  );
  return new AzureOpenAI({
    endpoint,
    azureADTokenProvider,
    apiVersion,
    deployment,
  });
}

let primary: AiChatClient | null = null;
let mini: AiChatClient | null = null;

/** gpt-5.4 — heavy course generation. Called once per course. */
export function getGenerationClient(): AiChatClient {
  primary ??= buildClient(serverEnv.azure.deployment);
  return primary;
}

/** gpt-5.4-mini — cheap structural tasks + schema repair. */
export function getMiniClient(): AiChatClient {
  mini ??= buildClient(serverEnv.azure.deploymentMini);
  return mini;
}

/** Deployment / model id for chat.completions (required on Foundry v1 API key path). */
export function getGenerationModel(): string {
  return serverEnv.azure.deployment;
}

export function getMiniModel(): string {
  return serverEnv.azure.deploymentMini;
}
