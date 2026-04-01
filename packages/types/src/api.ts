import { z } from "zod";

// ─── Generic API Response Wrapper ─────────────────────────────────────────────

export const ApiSuccessSchema = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    success: z.literal(true),
    data,
    meta: z
      .object({
        page: z.number().optional(),
        perPage: z.number().optional(),
        total: z.number().optional(),
      })
      .optional(),
  });

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

// ─── Pagination ───────────────────────────────────────────────────────────────

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(20),
});
export type Pagination = z.infer<typeof PaginationSchema>;

// ─── AI ───────────────────────────────────────────────────────────────────────

export const AiAnalysisRequestSchema = z.object({
  range: z.enum(["week", "month"]),
});

export const AiAnalysisResponseSchema = z.object({
  summary: z.string(),
  insights: z.array(
    z.object({
      type: z.enum(["positive", "warning", "suggestion"]),
      title: z.string(),
      description: z.string(),
    }),
  ),
  generatedAt: z.number(),
});
export type AiAnalysisResponse = z.infer<typeof AiAnalysisResponseSchema>;
