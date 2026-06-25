import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  preprocessDocument,
  reductionPercent,
} from "@/lib/ai/preprocess-document";
import { TARGET_DIGEST_CHARS } from "@/lib/ai/preprocess-config";

describe("preprocessDocument", () => {
  it("removes PDF-like page numbers and form feeds", () => {
    const raw = "Intro\n\f\n12\n\f\nBody about rice farming.\n\f\n13\n";
    const digest = preprocessDocument(raw);
    assert.ok(!digest.markdownOutline.includes("\f"));
    assert.match(digest.markdownOutline.toLowerCase(), /rice/);
  });

  it("segments markdown headings", () => {
    const raw = `# Rice Basics

First paragraph about seedlings.

## Soil Health

- Add organic matter
- Test pH

Second section details.`;
    const digest = preprocessDocument(raw);
    assert.ok(digest.sections.length >= 2);
    assert.ok(
      digest.sections.some((s) =>
        s.heading.toLowerCase().includes("soil"),
      ),
    );
    assert.ok(
      digest.sections.some((s) => s.bullets.some((b) => /organic/i.test(b))),
    );
  });

  it("dedupes repeated header lines across pages", () => {
    const page = "Extension Pamphlet 2024\nContent line one.\n";
    const raw = `${page}\f${page}\f${page}\fUnique closing facts about compost.`;
    const digest = preprocessDocument(raw);
    const bodyOccurrences = digest.sections
      .map((s) => `${s.heading} ${s.excerpt}`)
      .join(" ")
      .split("Extension Pamphlet 2024").length - 1;
    assert.ok(bodyOccurrences <= 1);
    assert.match(digest.markdownOutline.toLowerCase(), /compost/);
  });

  it("compresses a large synthetic document under target budget", () => {
    const section = (i: number) =>
      `## Topic ${i}\n\n` +
      `This is section ${i} about sustainable agriculture practices for smallholders in the Philippines. ` +
      `It includes detailed guidance on water management, soil enrichment, and integrated pest management for region ${i}. ` +
      `Farmers should monitor rainfall, rotate crops wisely, and document outcomes for extension workers.\n` +
      `- Bullet A for topic ${i} with actionable steps\n- Bullet B for topic ${i} with safety notes\n- Bullet C for topic ${i} with seasonal timing\n\n`;

    const raw = Array.from({ length: 120 }, (_, i) => section(i + 1)).join("");
    assert.ok(raw.length > 50_000);

    const digest = preprocessDocument(raw);
    assert.ok(digest.digestCharCount <= TARGET_DIGEST_CHARS);
    assert.ok(reductionPercent(digest) > 50);
  });

  it("preserves sparse short documents (QAD AI-02)", () => {
    const raw =
      "Short guide to cover crops.\n\nPlant legumes between seasons to protect soil.";
    const digest = preprocessDocument(raw);
    assert.ok(digest.digestCharCount > 0);
    assert.match(digest.markdownOutline.toLowerCase(), /cover crops/);
    assert.ok(digest.digestCharCount <= digest.rawCharCount);
  });

  it("fixes PDF hyphenation across line breaks", () => {
    const raw = "Use cover crops for sustain-\nable soil health.";
    const digest = preprocessDocument(raw);
    assert.match(digest.markdownOutline, /sustainable/i);
    assert.ok(!digest.markdownOutline.includes("sustain-\n"));
  });
});
