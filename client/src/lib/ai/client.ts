import { AzureOpenAI } from "openai";
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
 * Server-only module: importing this into a Client Component will leak nothing
 * (env reads throw), but it must stay on the server regardless.
 */

const COGNITIVE_SCOPE = "https://cognitiveservices.azure.com/.default";

function buildClient(deployment: string): AzureOpenAI {
  const { endpoint, apiVersion, apiKey } = serverEnv.azure;

  if (apiKey) {
    return new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });
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

let primary: AzureOpenAI | null = null;
let mini: AzureOpenAI | null = null;

/** gpt-5.4 — heavy course generation. Called once per course. */
export function getGenerationClient(): AzureOpenAI {
  primary ??= buildClient(serverEnv.azure.deployment);
  return primary;
}

/** gpt-5.4-mini — cheap structural tasks + schema repair. */
export function getMiniClient(): AzureOpenAI {
  mini ??= buildClient(serverEnv.azure.deploymentMini);
  return mini;
}
