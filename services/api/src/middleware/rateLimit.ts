import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

// Simple in-memory rate limiter (use Redis in production)
const requests = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 120; // per window per user/IP

export const rateLimitMiddleware = createMiddleware(async (c, next) => {
  const key =
    c.req.header("Authorization") ??
    c.req.header("x-forwarded-for") ??
    "unknown";
  const now = Date.now();

  const entry = requests.get(key);

  if (!entry || entry.resetAt < now) {
    requests.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count++;
    if (entry.count > MAX_REQUESTS) {
      c.header("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
      throw new HTTPException(429, { message: "Too many requests" });
    }
  }

  await next();
});
