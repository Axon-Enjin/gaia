import {
  MAX_EXCERPT_CHARS,
  MAX_SECTIONS,
  REPEAT_LINE_THRESHOLD,
  TARGET_DIGEST_CHARS,
} from "@/lib/ai/preprocess-config";

export interface DigestSection {
  heading: string;
  bullets: string[];
  excerpt: string;
}

export interface SourceDigest {
  rawCharCount: number;
  digestCharCount: number;
  titleCandidates: string[];
  industryHints: string[];
  sections: DigestSection[];
  markdownOutline: string;
}

interface RawSection {
  heading: string;
  body: string;
  bullets: string[];
}

const INDUSTRY_KEYWORDS = [
  "agriculture",
  "farming",
  "health",
  "finance",
  "technology",
  "education",
  "trades",
  "livelihood",
  "rice",
  "crop",
  "soil",
] as const;

const HEADING_MARKDOWN = /^#{1,3}\s+(.+)$/;
const HEADING_NUMBERED = /^(\d+(?:\.\d+)*)\s+(.+)$/;
const BULLET_LINE = /^[-*•]\s+(.+)$/;
const PAGE_NUMBER = /^\s*\d{1,4}\s*$/;
const ALL_CAPS_HEADING = /^[A-Z][A-Z0-9\s\-–—:]{3,60}$/;

/** Deterministic middle layer: raw extracted text → compact pedagogical outline. */
export function preprocessDocument(rawText: string): SourceDigest {
  const rawCharCount = rawText.length;
  const withDedupe = dedupeRepeatedLines(rawText.replace(/\r\n/g, "\n"));
  const normalized = normalizeText(withDedupe);

  // Small sources: avoid outline boilerplate larger than the source (QAD AI-02).
  if (normalized.length < 2_000) {
    const markdownOutline = normalized;
    return {
      rawCharCount,
      digestCharCount: markdownOutline.length,
      titleCandidates: inferTitleCandidates([], normalized),
      industryHints: inferIndustryHints(normalized, []),
      sections: segmentSections(normalized).map(extractSection),
      markdownOutline,
    };
  }

  const rawSections = segmentSections(normalized);
  const sections = rawSections.map(extractSection).filter((s) => s.heading || s.excerpt || s.bullets.length > 0);
  const ranked = rankSections(sections);
  const trimmed = trimToBudget(ranked, TARGET_DIGEST_CHARS);
  const titleCandidates = inferTitleCandidates(trimmed, normalized);
  const industryHints = inferIndustryHints(normalized, trimmed);
  const markdownOutline = buildMarkdownOutline(trimmed, titleCandidates, industryHints);
  const digestCharCount = markdownOutline.length;

  return {
    rawCharCount,
    digestCharCount,
    titleCandidates,
    industryHints,
    sections: trimmed,
    markdownOutline,
  };
}

export function reductionPercent(digest: SourceDigest): number {
  if (digest.rawCharCount === 0) return 0;
  return Math.round(
    ((digest.rawCharCount - digest.digestCharCount) / digest.rawCharCount) * 100,
  );
}

function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\f/g, "\n\n")
    .replace(/(\w)-\n(\w)/g, "$1$2")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function dedupeRepeatedLines(text: string): string {
  const pages = text.split(/\f+/);
  if (pages.length < 2) {
    // Also try paragraph-gap splits for text-only uploads without form feeds.
    const gapPages = text.split(/\n{3,}/);
    if (gapPages.length < 2) return text;
    return dedupePages(gapPages).join("\n\n");
  }
  return dedupePages(pages).join("\n\n");
}

function dedupePages(pages: string[]): string[] {
  const lineCounts = new Map<string, number>();
  for (const page of pages) {
    const seenOnPage = new Set<string>();
    for (const line of page.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.length < 4 || trimmed.length > 120) continue;
      if (PAGE_NUMBER.test(trimmed)) continue;
      if (seenOnPage.has(trimmed)) continue;
      seenOnPage.add(trimmed);
      lineCounts.set(trimmed, (lineCounts.get(trimmed) ?? 0) + 1);
    }
  }

  const threshold = Math.max(2, Math.ceil(pages.length * REPEAT_LINE_THRESHOLD));
  const repeated = new Set<string>();
  for (const [line, count] of lineCounts) {
    if (count >= threshold) repeated.add(line);
  }

  if (repeated.size === 0) return pages;

  return pages
    .map((page) =>
      page
        .split("\n")
        .filter((line) => !repeated.has(line.trim()))
        .join("\n")
        .trim(),
    )
    .filter(Boolean);
}

function segmentSections(text: string): RawSection[] {
  const lines = text.split("\n");
  const sections: RawSection[] = [];
  let current: RawSection = { heading: "", body: "", bullets: [] };

  function pushCurrent() {
    const body = current.body.trim();
    const heading = current.heading.trim();
    if (heading || body || current.bullets.length > 0) {
      sections.push({
        heading,
        body,
        bullets: [...current.bullets],
      });
    }
    current = { heading: "", body: "", bullets: [] };
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (current.body && !current.body.endsWith("\n\n")) {
        current.body += "\n";
      }
      continue;
    }

    if (PAGE_NUMBER.test(trimmed)) continue;

    const md = trimmed.match(HEADING_MARKDOWN);
    if (md) {
      pushCurrent();
      current.heading = md[1].trim();
      continue;
    }

    const numbered = trimmed.match(HEADING_NUMBERED);
    if (numbered && numbered[2].length < 100 && !numbered[2].includes(".")) {
      pushCurrent();
      current.heading = numbered[2].trim();
      continue;
    }

    if (ALL_CAPS_HEADING.test(trimmed) && trimmed.length < 80) {
      pushCurrent();
      current.heading = toTitleCase(trimmed);
      continue;
    }

    const bullet = trimmed.match(BULLET_LINE);
    if (bullet) {
      current.bullets.push(bullet[1].trim());
      continue;
    }

    current.body += (current.body ? "\n" : "") + trimmed;
  }

  pushCurrent();

  if (sections.length === 0 && text.trim()) {
    return [{ heading: "", body: text.trim(), bullets: [] }];
  }

  return sections;
}

function extractSection(raw: RawSection): DigestSection {
  const heading = raw.heading || inferHeadingFromBody(raw.body);
  const bullets = raw.bullets.slice(0, 12);
  const excerpt = buildExcerpt(raw.body, bullets);
  return { heading, bullets, excerpt };
}

function inferHeadingFromBody(body: string): string {
  const first = body.split(/\n+/)[0]?.trim() ?? "";
  if (first.length > 0 && first.length <= 80) return first;
  return "Section";
}

function buildExcerpt(body: string, bullets: string[]): string {
  const cleaned = body.replace(/\s+/g, " ").trim();
  if (!cleaned && bullets.length > 0) {
    return bullets.slice(0, 2).join(" ");
  }
  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  let excerpt = "";
  for (const sentence of sentences.slice(0, 2)) {
    if ((excerpt + sentence).length > MAX_EXCERPT_CHARS) break;
    excerpt += (excerpt ? " " : "") + sentence;
  }
  if (!excerpt) excerpt = cleaned.slice(0, MAX_EXCERPT_CHARS);
  return excerpt.slice(0, MAX_EXCERPT_CHARS);
}

function sectionScore(section: DigestSection): number {
  let score = 0;
  if (section.heading && section.heading !== "Section") score += 3;
  score += Math.min(section.bullets.length, 6);
  score += Math.min(section.excerpt.length / 80, 4);
  return score;
}

function rankSections(sections: DigestSection[]): DigestSection[] {
  return [...sections]
    .sort((a, b) => sectionScore(b) - sectionScore(a))
    .slice(0, MAX_SECTIONS);
}

function trimToBudget(sections: DigestSection[], budget: number): DigestSection[] {
  const result: DigestSection[] = [];
  let used = 0;

  for (const section of sections) {
    const block = sectionBlock(section);
    if (used + block.length > budget && result.length > 0) break;
    result.push(section);
    used += block.length;
  }

  if (result.length === 0 && sections.length > 0) {
    const first = sections[0];
    result.push({
      ...first,
      excerpt: first.excerpt.slice(0, Math.min(MAX_EXCERPT_CHARS, budget - 50)),
      bullets: first.bullets.slice(0, 3),
    });
  }

  return result;
}

function sectionBlock(section: DigestSection): string {
  const lines: string[] = [];
  if (section.heading) lines.push(`## ${section.heading}`);
  if (section.excerpt) lines.push(section.excerpt);
  for (const b of section.bullets) lines.push(`- ${b}`);
  return lines.join("\n") + "\n\n";
}

function inferTitleCandidates(sections: DigestSection[], normalized: string): string[] {
  const candidates: string[] = [];
  const firstHeading = sections.find((s) => s.heading && s.heading !== "Section")?.heading;
  if (firstHeading) candidates.push(firstHeading);

  const firstLine = normalized.split("\n").find((l) => l.trim().length > 5)?.trim();
  if (firstLine && firstLine.length <= 100) candidates.push(firstLine);

  return [...new Set(candidates)].slice(0, 3);
}

function inferIndustryHints(normalized: string, sections: DigestSection[]): string[] {
  const haystack = `${normalized}\n${sections.map((s) => `${s.heading} ${s.excerpt}`).join(" ")}`.toLowerCase();
  const hits = INDUSTRY_KEYWORDS.filter((kw) => haystack.includes(kw));
  if (hits.includes("agriculture") || hits.includes("farming") || hits.includes("rice") || hits.includes("crop") || hits.includes("soil")) {
    return ["Agriculture", ...hits.filter((h) => h !== "agriculture" && h !== "farming")];
  }
  return hits.map((h) => h.charAt(0).toUpperCase() + h.slice(1)).slice(0, 4);
}

function buildMarkdownOutline(
  sections: DigestSection[],
  titleCandidates: string[],
  industryHints: string[],
): string {
  const parts: string[] = ["# Source digest (preprocessed from uploaded document)", ""];

  if (titleCandidates.length > 0) {
    parts.push(`Title candidates: ${titleCandidates.join(" | ")}`, "");
  }
  if (industryHints.length > 0) {
    parts.push(`Industry hints: ${industryHints.join(", ")}`, "");
  }

  parts.push("## Outline", "");
  for (const section of sections) {
    parts.push(sectionBlock(section).trimEnd());
  }

  return parts.join("\n").trim();
}

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
