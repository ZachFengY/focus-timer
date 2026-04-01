import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";

import { log } from "../utils/logger";

export const errorHandler: ErrorHandler = (err, c) => {
  const requestId =
    c.req.header("x-request-id") ?? c.get("requestId" as never) ?? "unknown";

  // Zod validation errors — 422 with field details
  if (err instanceof ZodError) {
    log.warn({ requestId, issues: err.issues }, "Validation error");
    return c.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
          details: err.flatten(),
        },
      },
      422,
    );
  }

  // HTTP exceptions (auth, not found, rate limit…)
  if (err instanceof HTTPException) {
    const level = err.status >= 500 ? "error" : "warn";
    log[level](
      { requestId, status: err.status, message: err.message },
      "HTTP exception",
    );
    return c.json(
      {
        success: false,
        error: {
          code:
            err.status === 401
              ? "UNAUTHORIZED"
              : err.status === 403
                ? "FORBIDDEN"
                : err.status === 404
                  ? "NOT_FOUND"
                  : err.status === 429
                    ? "RATE_LIMITED"
                    : "HTTP_ERROR",
          message: err.message,
        },
      },
      err.status,
    );
  }

  // Unknown / unhandled — always log with full stack
  log.error({ requestId, err, stack: (err as Error).stack }, "Unhandled error");
  return c.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred",
        // Only expose details in dev
        ...(process.env["NODE_ENV"] !== "production" && {
          details: (err as Error).message,
          stack: (err as Error).stack,
        }),
      },
    },
    500,
  );
};
