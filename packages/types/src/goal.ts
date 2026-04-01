import { z } from "zod";

export const GoalTypeSchema = z.enum(["daily", "weekly", "monthly", "subject"]);
export type GoalType = z.infer<typeof GoalTypeSchema>;

export const GoalSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: GoalTypeSchema,
  targetDuration: z.number().int().positive(), // seconds
  subjectId: z.string().uuid().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type Goal = z.infer<typeof GoalSchema>;

// Goal with computed progress (returned by API)
export const GoalWithProgressSchema = GoalSchema.extend({
  actualDuration: z.number().int().nonnegative(), // seconds
  progress: z.number().min(0).max(1), // 0.0 – 1.0
  isCompleted: z.boolean(),
  subjectName: z.string().nullable(),
  subjectColor: z.string().nullable(),
});
export type GoalWithProgress = z.infer<typeof GoalWithProgressSchema>;

export const CreateGoalSchema = z.object({
  type: GoalTypeSchema,
  targetDuration: z.number().int().positive(),
  subjectId: z.string().uuid().nullable().default(null),
});
export type CreateGoal = z.infer<typeof CreateGoalSchema>;

export const UpdateGoalSchema = CreateGoalSchema.partial();
export type UpdateGoal = z.infer<typeof UpdateGoalSchema>;
