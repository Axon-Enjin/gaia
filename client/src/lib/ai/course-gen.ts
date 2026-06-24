import {
  getGenerationClient,
  getGenerationModel,
  getMiniClient,
  getMiniModel,
} from "@/lib/ai/client";
import {
  COURSE_SYSTEM_PROMPT,
  REPAIR_SYSTEM_PROMPT,
} from "@/lib/ai/prompts";
import { wrapUntrusted, type GenerationHints } from "@/lib/ai/untrusted";
import { courseSchema, type Course } from "@/lib/ai/course-schema";

/** Hard cap on generated output tokens (cost bound, SDD §8). */
const MAX_OUTPUT_TOKENS = 8_000;

export class CourseGenerationError extends Error {
  constructor(
    message: string,
    readonly code: "schema" | "provider",
  ) {
    super(message);
    this.name = "CourseGenerationError";
  }
}

/** Best-effort JSON extraction from a model response (tolerates stray fences). */
function extractJson(raw: string | null | undefined): unknown {
  if (!raw) throw new CourseGenerationError("empty model response", "schema");
  const trimmed = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "");
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  const candidate =
    start >= 0 && end > start ? trimmed.slice(start, end + 1) : trimmed;
  try {
    return JSON.parse(candidate);
  } catch {
    throw new CourseGenerationError("model output was not valid JSON", "schema");
  }
}

/**
 * Generate a structured course from untrusted source text.
 *
 * Flow (rfc-aniskwela-002 §2):
 *   1. One gpt-5.4 call — static system prompt first (auto-cached), untrusted
 *      source + hints last.
 *   2. Validate against the Zod schema.
 *   3. On failure, ONE bounded gpt-5.4-mini repair pass.
 *   4. Still invalid -> throw (caller returns 422). Never persist garbage.
 *
 * Called once per course, never on a learner read path.
 */
export async function generateCourse(
  sourceText: string,
  hints: GenerationHints,
): Promise<Course> {
  const userContent = wrapUntrusted(sourceText, hints);

  let rawJson: unknown;
  try {
    const client = getGenerationClient();
    const res = await client.chat.completions.create({
      model: getGenerationModel(),
      max_completion_tokens: MAX_OUTPUT_TOKENS,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: COURSE_SYSTEM_PROMPT }, // static -> cached
        { role: "user", content: userContent }, // untrusted data
      ],
    });
    rawJson = extractJson(res.choices[0]?.message?.content);
  } catch (err) {
    if (err instanceof CourseGenerationError) throw err;
    throw new CourseGenerationError(
      `provider error: ${(err as Error).message}`,
      "provider",
    );
  }

  const first = courseSchema.safeParse(rawJson);
  if (first.success) return first.data;

  // One bounded repair pass with the cheap model.
  const repaired = await repairCourseJson(rawJson, first.error.message);
  const second = courseSchema.safeParse(repaired);
  if (second.success) return second.data;

  throw new CourseGenerationError(
    "AI output failed schema validation after repair",
    "schema",
  );
}

async function repairCourseJson(
  invalid: unknown,
  validationError: string,
): Promise<unknown> {
  try {
    const client = getMiniClient();
    const res = await client.chat.completions.create({
      model: getMiniModel(),
      max_completion_tokens: MAX_OUTPUT_TOKENS,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: REPAIR_SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            "The following JSON failed validation. Fix it to match the schema.",
            `Validation error: ${validationError}`,
            "",
            JSON.stringify(invalid),
          ].join("\n"),
        },
      ],
    });
    return extractJson(res.choices[0]?.message?.content);
  } catch (err) {
    if (err instanceof CourseGenerationError) throw err;
    throw new CourseGenerationError(
      `repair provider error: ${(err as Error).message}`,
      "provider",
    );
  }
}
