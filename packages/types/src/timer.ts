import { z } from "zod";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const TimerModeSchema = z.enum(["countup", "countdown"]);
export type TimerMode = z.infer<typeof TimerModeSchema>;

export const TimerStatusSchema = z.enum([
  "idle",
  "running",
  "paused",
  "finished",
]);
export type TimerStatus = z.infer<typeof TimerStatusSchema>;

// ─── Domain Models ────────────────────────────────────────────────────────────

export const PauseRecordSchema = z.object({
  id: z.string().uuid(),
  timeRecordId: z.string().uuid(),
  startTime: z.number(), // Unix ms
  endTime: z.number().nullable(),
});
export type PauseRecord = z.infer<typeof PauseRecordSchema>;

export const TimeRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  subjectId: z.string().uuid().nullable(),
  mode: TimerModeSchema,
  duration: z.number().int().nonnegative(), // seconds
  startTime: z.number(), // Unix ms
  endTime: z.number().nullable(), // Unix ms
  pauses: z.array(PauseRecordSchema),
  createdAt: z.number(), // Unix ms
});
export type TimeRecord = z.infer<typeof TimeRecordSchema>;

// ─── Timer State (Client-side only, not persisted to DB directly) ─────────────

export const TimerStateSchema = z.object({
  status: TimerStatusSchema,
  mode: TimerModeSchema,
  startTime: z.number().nullable(), // Unix ms when started
  accumulatedSeconds: z.number().default(0), // seconds before current run
  targetSeconds: z.number().nullable(), // for countdown mode
  currentSubjectId: z.string().uuid().nullable(),
  activeRecordId: z.string().uuid().nullable(),
});
export type TimerState = z.infer<typeof TimerStateSchema>;

// ─── API Request / Response Schemas ───────────────────────────────────────────

export const CreateTimeRecordSchema = z.object({
  subjectId: z.string().uuid().nullable(),
  mode: TimerModeSchema,
  duration: z.number().int().positive(),
  startTime: z.number(),
  endTime: z.number(),
  pauses: z.array(
    z.object({
      startTime: z.number(),
      endTime: z.number(),
    }),
  ),
});
export type CreateTimeRecord = z.infer<typeof CreateTimeRecordSchema>;
