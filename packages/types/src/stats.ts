import { z } from "zod";

export const StatRangeSchema = z.enum(["day", "week", "month", "year"]);
export type StatRange = z.infer<typeof StatRangeSchema>;

// Summary metrics
export const StatsSummarySchema = z.object({
  totalDuration: z.number(), // seconds
  avgDailyDuration: z.number(), // seconds
  maxDailyDuration: z.number(), // seconds
  streak: z.number().int(), // consecutive days
  longestStreak: z.number().int(),
  recordCount: z.number().int(),
});
export type StatsSummary = z.infer<typeof StatsSummarySchema>;

// Per-subject breakdown (pie chart data)
export const SubjectStatSchema = z.object({
  subjectId: z.string().uuid().nullable(),
  subjectName: z.string(),
  subjectColor: z.string(),
  duration: z.number(), // seconds
  percentage: z.number(), // 0-100
  recordCount: z.number().int(),
});
export type SubjectStat = z.infer<typeof SubjectStatSchema>;

// Daily breakdown (bar chart data)
export const DailyStatSchema = z.object({
  date: z.string(), // ISO date: "2025-03-18"
  duration: z.number(), // seconds
  recordCount: z.number().int(),
  subjects: z.array(
    z.object({
      subjectId: z.string().uuid().nullable(),
      duration: z.number(),
      color: z.string(),
    }),
  ),
});
export type DailyStat = z.infer<typeof DailyStatSchema>;

// Full stats response
export const StatsResponseSchema = z.object({
  range: StatRangeSchema,
  startDate: z.string(),
  endDate: z.string(),
  summary: StatsSummarySchema,
  bySubject: z.array(SubjectStatSchema),
  byDay: z.array(DailyStatSchema),
});
export type StatsResponse = z.infer<typeof StatsResponseSchema>;

// Calendar heatmap data
export const CalendarDaySchema = z.object({
  date: z.string(),
  totalDuration: z.number(), // seconds
  hasRecords: z.boolean(),
  subjects: z.array(
    z.object({
      color: z.string(),
      duration: z.number(),
    }),
  ),
});
export type CalendarDay = z.infer<typeof CalendarDaySchema>;
