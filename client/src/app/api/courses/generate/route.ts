import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { flags } from "@/lib/env";
import { extractText, FileExtractionError } from "@/lib/ai/extract-text";
import { generateCourse, CourseGenerationError } from "@/lib/ai/course-gen";
import { prepareSourceForGeneration } from "@/lib/ai/prepare-source";
import { DistillSourceError } from "@/lib/ai/distill-source";
import { persistDraftCourse } from "@/lib/courses/persist";
import { quizCount as countQuiz, lessonCount as countLessons } from "@/lib/ai/course-schema";

// Generation is a bounded synchronous call; allow more time than a normal route.
// (runtime defaults to nodejs; an explicit `runtime` export is incompatible
// with cacheComponents.)
export const maxDuration = 120;

const FieldsSchema = z.object({
  industry: z.string().min(1).max(120).optional(),
  title_hint: z.string().max(300).optional(),
});

/**
 * POST /api/courses/generate  (PRD-F1, rfc-aniskwela-002 §3)
 *
 * multipart/form-data: file (PDF/text); optional industry, title_hint overrides.
 * Title and industry are inferred from the document when overrides are omitted.
 * Persists a DRAFT course owned by the authenticated teacher. Never publishes.
 */
export async function POST(req: Request) {
  if (!flags.aiGeneration) {
    return Response.json(
      { error: "ai_generation_disabled" },
      { status: 503 },
    );
  }

  // --- AuthN: must be a signed-in user ---
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  // --- AuthZ: must be a teacher (server-side, RLS-backed) ---
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "teacher") {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  // --- Validate input at the boundary ---
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "invalid_form" }, { status: 400 });
  }

  const industryRaw = form.get("industry");
  const titleRaw = form.get("title_hint");
  const parsedFields = FieldsSchema.safeParse({
    industry:
      typeof industryRaw === "string" && industryRaw.trim()
        ? industryRaw.trim()
        : undefined,
    title_hint:
      typeof titleRaw === "string" && titleRaw.trim()
        ? titleRaw.trim()
        : undefined,
  });
  if (!parsedFields.success) {
    return Response.json(
      { error: "invalid_fields", details: parsedFields.error.flatten() },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "missing_file" }, { status: 400 });
  }

  // --- Extract text (server-side) ---
  let sourceText: string;
  try {
    sourceText = await extractText({
      bytes: await file.arrayBuffer(),
      type: file.type,
      name: file.name,
    });
  } catch (err) {
    if (err instanceof FileExtractionError) {
      return Response.json(
        { error: "bad_file", message: err.message },
        { status: 400 },
      );
    }
    throw err;
  }

  // --- Preprocess (deterministic) + optional mini distill ---
  let prepared;
  try {
    prepared = await prepareSourceForGeneration(sourceText);
  } catch (err) {
    if (err instanceof DistillSourceError) {
      return Response.json(
        { error: "distill_failed", message: err.message },
        { status: 502 },
      );
    }
    throw err;
  }

  // --- Generate (single cached gpt-5.4 call + bounded repair) ---
  let course;
  try {
    course = await generateCourse(prepared.preparedText, {
      ...(parsedFields.data.industry
        ? { industry: parsedFields.data.industry }
        : {}),
      ...(parsedFields.data.title_hint
        ? { titleHint: parsedFields.data.title_hint }
        : {}),
    });
  } catch (err) {
    if (err instanceof CourseGenerationError) {
      // schema -> 422 (never persist garbage); provider -> 502 (clear retry)
      const status = err.code === "schema" ? 422 : 502;
      return Response.json({ error: err.code, message: err.message }, { status });
    }
    throw err;
  }

  // --- Persist as draft (RLS enforces teacher ownership) ---
  const draft = await persistDraftCourse(supabase, user.id, course);

  return Response.json({
    course_id: draft.courseId,
    status: "draft",
    title: course.title,
    industry: course.industry,
    lesson_count: countLessons(course),
    quiz_count: countQuiz(course),
    preprocess: {
      raw_chars: prepared.digest.rawCharCount,
      digest_chars: prepared.digest.digestCharCount,
      prepared_chars: prepared.preparedCharCount,
      reduction_pct: prepared.reductionPct,
      mini_distill_used: prepared.miniDistillUsed,
    },
  });
}
