import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

/**
 * Render lesson Markdown to SANITIZED HTML on the SERVER (SDD §8.1 LLM02 —
 * AI/teacher text is never executed; we render data, not code).
 *
 * Server-only: marked + sanitize-html stay out of the client bundle. Output is
 * safe to pass to dangerouslySetInnerHTML.
 */
export function renderMarkdown(md: string): string {
  const rawHtml = marked.parse(md, { async: false }) as string;

  return sanitizeHtml(rawHtml, {
    allowedTags: [
      "p",
      "br",
      "hr",
      "h1",
      "h2",
      "h3",
      "h4",
      "ul",
      "ol",
      "li",
      "strong",
      "em",
      "code",
      "pre",
      "blockquote",
      "a",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ],
    allowedAttributes: {
      a: ["href", "title"],
    },
    // Only safe link schemes; no javascript:, no data: URIs.
    allowedSchemes: ["http", "https", "mailto"],
    // Drop the content of anything not allowed (e.g. <script>).
    disallowedTagsMode: "discard",
  });
}
