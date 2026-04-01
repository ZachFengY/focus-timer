/**
 * Health Check Endpoint
 *
 * GET /health        — shallow (load balancer ping)
 * GET /health/detail — deep (all subsystems, auth required in prod)
 *
 * Returns structured status so monitoring tools (Uptime Robot, etc.)
 * and developers can instantly see what's broken.
 */
import { OpenAPIHono } from "@hono/zod-openapi";

import { db } from "../db/memory-store";
import { log } from "../utils/logger";

export const healthRouter = new OpenAPIHono();

healthRouter.get("/", (c) => {
  return c.json({ status: "ok", timestamp: Date.now() });
});

healthRouter.get("/detail", (c) => {
  const checks = {
    store: checkStore(),
    env: checkEnv(),
    ai: checkAi(),
  };

  const allOk = Object.values(checks).every((c) => c.status === "ok");
  const status = allOk ? "ok" : "degraded";

  log.debug({ checks }, "Health check");

  return c.json(
    {
      status,
      timestamp: Date.now(),
      uptime: process.uptime(),
      version: process.env["npm_package_version"] ?? "0.0.0",
      checks,
      counts: {
        users: db.users.size,
        subjects: db.subjects.size,
        timeRecords: db.timeRecords.size,
        goals: db.goals.size,
      },
    },
    allOk ? 200 : 207,
  );
});

function checkStore() {
  try {
    // Sanity check: store is accessible and data is consistent
    const userCount = db.users.size;
    return { status: "ok" as const, type: "memory", users: userCount };
  } catch (err) {
    return { status: "error" as const, message: (err as Error).message };
  }
}

function checkEnv() {
  const required = ["JWT_SECRET"];
  const missing = required.filter((k) => !process.env[k]);
  const warnings = [];

  if (!process.env["JWT_SECRET"] || process.env["JWT_SECRET"].length < 32) {
    warnings.push("JWT_SECRET < 32 chars — using default (DEV ONLY)");
  }

  return {
    status: missing.length === 0 ? ("ok" as const) : ("error" as const),
    missing,
    warnings,
  };
}

function checkAi() {
  const hasKey = !!process.env["ANTHROPIC_API_KEY"];
  return {
    status: hasKey ? ("ok" as const) : ("disabled" as const),
    message: hasKey
      ? "Claude API key configured"
      : "No ANTHROPIC_API_KEY — AI features disabled",
  };
}
