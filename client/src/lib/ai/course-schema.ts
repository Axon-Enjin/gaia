import { z } from "zod";

/**
 * Course JSON contract (rfc-aniskwela-002 §3). Shared between AI generation and the
 * Course Editor. The AI model returns DATA in this shape — never executed.
 *
 * Bounds are deliberately tight: they cap model output size (cost/perf) and
 * reject malformed drafts before anything is persisted.
 */

export const difficultyEnum = z.enum([
  "beginner",
  "intermediate",
  "advanced",
]);
export type Difficulty = z.infer<typeof difficultyEnum>;

export const questionSchema = z
  .object({
    prompt: z.string().min(1).max(1000),
    choices: z.array(z.string().min(1).max(500)).min(2).max(6),
    answer_index: z.number().int().min(0),
  })
  // answer_index must point at an existing choice.
  .refine((q) => q.answer_index < q.choices.length, {
    message: "answer_index out of range",
    path: ["answer_index"],
  });
export type Question = z.infer<typeof questionSchema>;

export const lessonSchema = z.object({
  title: z.string().min(1).max(300),
  body_md: z.string().min(1).max(20_000),
  difficulty: difficultyEnum,
  quiz: z.array(questionSchema).min(1).max(20),
});
export type Lesson = z.infer<typeof lessonSchema>;

export const moduleSchema = z.object({
  title: z.string().min(1).max(300),
  lessons: z.array(lessonSchema).min(1).max(20),
});
export type Module = z.infer<typeof moduleSchema>;

export const courseSchema = z
  .object({
    title: z.string().min(1).max(300),
    industry: z.string().min(1).max(120),
    modules: z.array(moduleSchema).min(1).max(20),
  })
  // Success criterion (rfc-aniskwela-002 §1): a course has at least 3 quiz questions.
  .refine(
    (c) =>
      c.modules.reduce(
        (sum, m) => sum + m.lessons.reduce((s, l) => s + l.quiz.length, 0),
        0,
      ) >= 3,
    { message: "course must contain at least 3 quiz questions" },
  );
export type Course = z.infer<typeof courseSchema>;

/** Total quiz questions across the whole course. */
export function quizCount(course: Course): number {
  return course.modules.reduce(
    (sum, m) => sum + m.lessons.reduce((s, l) => s + l.quiz.length, 0),
    0,
  );
}

/** Total lessons across the whole course. */
export function lessonCount(course: Course): number {
  return course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
}
