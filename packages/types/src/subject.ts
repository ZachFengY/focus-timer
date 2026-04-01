import { z } from "zod";

export const SubjectSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1).max(50),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .nullable(),
  icon: z.string().nullable(),
  isDeleted: z.boolean().default(false),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type Subject = z.infer<typeof SubjectSchema>;

export const CreateSubjectSchema = z.object({
  name: z.string().min(1).max(50),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .nullable()
    .default(null),
  icon: z.string().nullable().default(null),
});
export type CreateSubject = z.infer<typeof CreateSubjectSchema>;

export const UpdateSubjectSchema = CreateSubjectSchema.partial();
export type UpdateSubject = z.infer<typeof UpdateSubjectSchema>;

// Preset colors matching design system
export const SUBJECT_COLORS = [
  "#6366F1", // Indigo
  "#32D583", // Green
  "#E85A4F", // Coral
  "#FFB547", // Amber
  "#8B5CF6", // Purple
  "#3B82F6", // Blue
  "#F59E0B", // Yellow
  "#EF4444", // Red
] as const;
