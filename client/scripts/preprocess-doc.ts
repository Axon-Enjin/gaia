import { readFile } from "node:fs/promises";
import path from "node:path";
import { extractText } from "../src/lib/ai/extract-text";
import {
  preprocessDocument,
  reductionPercent,
} from "../src/lib/ai/preprocess-document";

async function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error("Usage: npm run preprocess-doc -- <path-to.pdf|.txt|.md>");
    process.exit(1);
  }

  const abs = path.resolve(fileArg);
  const bytes = await readFile(abs);
  const name = path.basename(abs);
  const type =
    name.endsWith(".pdf")
      ? "application/pdf"
      : name.endsWith(".md") || name.endsWith(".markdown")
        ? "text/markdown"
        : "text/plain";

  const raw = await extractText({
    bytes: bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ),
    type,
    name,
  });

  const digest = preprocessDocument(raw);
  const reduction = reductionPercent(digest);

  console.log("--- preprocess-doc ---");
  console.log(`file:          ${name}`);
  console.log(`raw chars:     ${digest.rawCharCount.toLocaleString()}`);
  console.log(`digest chars:  ${digest.digestCharCount.toLocaleString()}`);
  console.log(`reduction:     ${reduction}%`);
  console.log(`sections:      ${digest.sections.length}`);
  console.log(`title hints:   ${digest.titleCandidates.join(" | ") || "(none)"}`);
  console.log(`industry hints:${digest.industryHints.join(", ") || "(none)"}`);
  console.log("");
  console.log("--- markdown outline (first 2000 chars) ---");
  console.log(digest.markdownOutline.slice(0, 2000));
  if (digest.markdownOutline.length > 2000) {
    console.log("\n... (truncated)");
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
