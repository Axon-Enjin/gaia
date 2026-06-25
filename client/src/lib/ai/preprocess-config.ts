/** Goal size after deterministic preprocessing (~3k tokens). */
export const TARGET_DIGEST_CHARS = 12_000;

/** Trigger gpt-5.4-mini distill when digest still exceeds this. */
export const MINI_DISTILL_THRESHOLD_CHARS = 18_000;

/** Max sections kept in the ranked outline. */
export const MAX_SECTIONS = 24;

/** Per-section excerpt cap. */
export const MAX_EXCERPT_CHARS = 400;

/** Lines repeated on more than this fraction of pages are treated as headers/footers. */
export const REPEAT_LINE_THRESHOLD = 0.3;
