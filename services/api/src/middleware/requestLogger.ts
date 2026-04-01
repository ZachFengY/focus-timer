/**
 * Request Logger Middleware
 *
 * Attaches a unique requestId to every request for end-to-end tracing.
 * Logs: method, path, status, duration, userId (if authed).
 * Warns on slow responses (> SLOW_THRESHOLD_MS).
 *
 * Debug tip: search logs by requestId to trace a specific request
 * across all log entries. Frontend should forward this ID in X-Request-Id.
 */
import { randomUUID } from "node:crypto";

import { createMiddleware } from "hono/factory";

import { log } from "../utils/logger";

const SLOW_THRESHOLD_MS = 500;

export type RequestContext = {
  Variables: {
    requestId: string;
    startTime: number;
    userId?: string;
  };
};

export const requestLoggerMiddleware = createMiddleware<RequestContext>(
  async (c, next) => {
    const requestId = (c.req.header("x-request-id") ?? randomUUID()) as string;
    const startTime = performance.now();

    c.set("requestId", requestId);
    c.set("startTime", startTime);

    // Attach requestId to response so client can correlate
    c.header("x-request-id", requestId);

    const reqLog = log.child({ requestId });

    reqLog.debug(
      { method: c.req.method, path: c.req.path },
      "→ incoming request",
    );

    await next();

    const duration = Math.round(performance.now() - startTime);
    const status = c.res.status;
    const userId = c.get("userId");

    const meta = {
      method: c.req.method,
      path: c.req.path,
      status,
      duration,
      userId,
      requestId,
    };

    if (duration > SLOW_THRESHOLD_MS) {
      reqLog.warn(
        { ...meta, threshold: SLOW_THRESHOLD_MS },
        `⚠️ slow response ${duration}ms`,
      );
    } else if (status >= 500) {
      reqLog.error(meta, `✗ [${status}] ${c.req.method} ${c.req.path}`);
    } else if (status >= 400) {
      reqLog.warn(meta, `△ [${status}] ${c.req.method} ${c.req.path}`);
    } else {
      reqLog.info(
        meta,
        `✓ [${status}] ${c.req.method} ${c.req.path} ${duration}ms`,
      );
    }
  },
);
