/**
 * Server-side text extraction from an uploaded source document.
 *
 * MVP scope: plain text / markdown directly; PDF via a lazy dynamic import so
 * the parser never enters the client bundle (low-resource budget). Extracted
 * text is treated as UNTRUSTED downstream (untrusted.ts).
 */

export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

export class FileExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileExtractionError";
  }
}

const TEXT_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "text/x-markdown",
  "application/json",
]);

export async function extractText(file: {
  bytes: ArrayBuffer;
  type: string;
  name: string;
}): Promise<string> {
  if (file.bytes.byteLength === 0) {
    throw new FileExtractionError("empty file");
  }
  if (file.bytes.byteLength > MAX_FILE_BYTES) {
    throw new FileExtractionError("file too large");
  }

  const isPdf =
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf");

  if (isPdf) {
    return extractPdf(file.bytes);
  }

  const isText =
    TEXT_TYPES.has(file.type) ||
    /\.(txt|md|markdown|json)$/i.test(file.name);

  if (isText) {
    const text = new TextDecoder("utf-8").decode(file.bytes).trim();
    if (!text) throw new FileExtractionError("no readable text in file");
    return text;
  }

  throw new FileExtractionError(`unsupported file type: ${file.type}`);
}

async function extractPdf(bytes: ArrayBuffer): Promise<string> {
  // Lazy import the lib subpath (avoids pdf-parse's index.js debug-mode bug)
  // and keeps the parser out of any shared/client bundle.
  try {
    const { default: pdfParse } = await import("pdf-parse/lib/pdf-parse.js");
    const result = await pdfParse(Buffer.from(bytes));
    const text = result.text.trim();
    if (!text) throw new FileExtractionError("no extractable text in PDF");
    return text;
  } catch (err) {
    if (err instanceof FileExtractionError) throw err;
    throw new FileExtractionError(
      "PDF text extraction failed for this file",
    );
  }
}
