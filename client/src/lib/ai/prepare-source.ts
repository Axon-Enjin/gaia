import { MINI_DISTILL_THRESHOLD_CHARS } from "@/lib/ai/preprocess-config";
import {
  preprocessDocument,
  reductionPercent,
  type SourceDigest,
} from "@/lib/ai/preprocess-document";
import { distillSource } from "@/lib/ai/distill-source";

export interface PreparedSource {
  /** Text passed to generateCourse() / wrapUntrusted(). */
  preparedText: string;
  digest: SourceDigest;
  miniDistillUsed: boolean;
  preparedCharCount: number;
  reductionPct: number;
}

/**
 * Middle layer: deterministic preprocess → optional mini distill → ready for gpt-5.4.
 */
export async function prepareSourceForGeneration(
  rawText: string,
): Promise<PreparedSource> {
  const digest = preprocessDocument(rawText);
  let preparedText = digest.markdownOutline;
  let miniDistillUsed = false;

  if (digest.digestCharCount > MINI_DISTILL_THRESHOLD_CHARS) {
    preparedText = await distillSource(digest.markdownOutline);
    miniDistillUsed = true;
  }

  const preparedCharCount = preparedText.length;
  const reductionPct =
    digest.rawCharCount > 0
      ? Math.round(
          ((digest.rawCharCount - preparedCharCount) / digest.rawCharCount) *
            100,
        )
      : 0;

  console.info(
    JSON.stringify({
      event: "course_preprocess",
      raw_chars: digest.rawCharCount,
      digest_chars: digest.digestCharCount,
      prepared_chars: preparedCharCount,
      mini_distill_used: miniDistillUsed,
      reduction_pct: miniDistillUsed ? reductionPct : reductionPercent(digest),
    }),
  );

  return {
    preparedText,
    digest,
    miniDistillUsed,
    preparedCharCount,
    reductionPct: miniDistillUsed ? reductionPct : reductionPercent(digest),
  };
}
