import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AiChatClient } from "@/lib/ai/client";
import { DISTILL_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import {
  DistillSourceError,
  distillSource,
} from "@/lib/ai/distill-source";

function stubMiniClient(content: string | null): AiChatClient {
  return {
    chat: {
      completions: {
        create: async (params) => {
          assert.equal(params.model, "test-mini");
          assert.equal(
            params.messages[0]?.role === "system" &&
              params.messages[0].content === DISTILL_SYSTEM_PROMPT,
            true,
          );
          assert.match(
            String(params.messages[1]?.content ?? ""),
            /<<<SOURCE_DIGEST_START>>>/,
          );
          return {
            choices: [{ message: { content } }],
          } as Awaited<
            ReturnType<AiChatClient["chat"]["completions"]["create"]>
          >;
        },
      },
    },
  } as AiChatClient;
}

describe("distillSource", () => {
  it("returns compressed outline from mini client", async () => {
    const outline = "# Big doc\n\n".repeat(2_000);
    const compressed = "# Rice farming\n\n- Key fact one\n- Key fact two";

    const result = await distillSource(outline, {
      client: stubMiniClient(compressed),
      model: "test-mini",
    });

    assert.equal(result, compressed);
    assert.ok(result.length < outline.length);
  });

  it("throws DistillSourceError on empty response", async () => {
    await assert.rejects(
      () =>
        distillSource("oversized digest", {
          client: stubMiniClient(null),
          model: "test-mini",
        }),
      DistillSourceError,
    );
  });
});
