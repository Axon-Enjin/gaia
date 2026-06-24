import { z } from "zod";

export const CourseSettingsSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  industry: z.string().trim().min(1).max(80),
  passing_score: z.coerce.number().int().min(0).max(100),
});

export const LessonUpdateSchema = z.object({
  courseId: z.string().uuid(),
  lessonId: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  body_md: z.string().trim().min(1).max(50_000),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
});

export const QuizUpdateSchema = z.object({
  courseId: z.string().uuid(),
  questionId: z.string().uuid(),
  prompt: z.string().trim().min(1).max(500),
  choices: z.array(z.string().trim().min(1).max(200)).min(2).max(6),
  answer_index: z.coerce.number().int().min(0),
}).superRefine((val, ctx) => {
  if (val.answer_index >= val.choices.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "answer_index out of range",
      path: ["answer_index"],
    });
  }
});
