import { serve } from "@hono/node-server";
import { OpenAPIHono } from "@hono/zod-openapi";

import { seedDatabase } from "./db/seed";
import { authMiddleware } from "./middleware/auth";
import { corsMiddleware } from "./middleware/cors";
import { errorHandler } from "./middleware/error";
import { rateLimitMiddleware } from "./middleware/rateLimit";
import { requestLoggerMiddleware } from "./middleware/requestLogger";
import { aiRouter } from "./routes/ai";
import { authRouter } from "./routes/auth";
import { goalsRouter } from "./routes/goals";
import { healthRouter } from "./routes/health";
import { statsRouter } from "./routes/stats";
import { subjectsRouter } from "./routes/subjects";
import { timeRecordsRouter } from "./routes/timeRecords";
import { log } from "./utils/logger";

// ── Startup validation ─────────────────────────────────────────────────────────
function validateEnv() {
  const warnings: string[] = [];
  if (!process.env["JWT_SECRET"])
    warnings.push("JWT_SECRET not set — using insecure default (DEV ONLY)");
  if (!process.env["ANTHROPIC_API_KEY"])
    warnings.push("ANTHROPIC_API_KEY not set — AI features disabled");
  for (const w of warnings) log.warn(w);
}

// ── App ────────────────────────────────────────────────────────────────────────
const app = new OpenAPIHono();

app.use("*", corsMiddleware);
app.use("*", requestLoggerMiddleware);
app.use("*", rateLimitMiddleware);
app.onError(errorHandler);

// ── Public routes ──────────────────────────────────────────────────────────────
app.route("/health", healthRouter);
app.route("/auth", authRouter);

// ── Protected v1 routes ────────────────────────────────────────────────────────
const v1 = new OpenAPIHono();
v1.use("*", authMiddleware);
v1.route("/subjects", subjectsRouter);
v1.route("/time-records", timeRecordsRouter);
v1.route("/stats", statsRouter);
v1.route("/goals", goalsRouter);
v1.route("/ai", aiRouter);

app.route("/v1", v1);

// ── OpenAPI docs (dev only) ────────────────────────────────────────────────────
if (process.env["NODE_ENV"] !== "production") {
  app.doc("/openapi.json", {
    openapi: "3.0.0",
    info: {
      title: "FocusFlow API",
      version: "1.0.0",
      description: "Local dev — in-memory store",
    },
    servers: [{ url: `http://localhost:${process.env["API_PORT"] ?? 3000}` }],
  });
}

// ── Start ──────────────────────────────────────────────────────────────────────
validateEnv();
seedDatabase();

const port = Number(process.env["API_PORT"] ?? 3000);
serve({ fetch: app.fetch, port }, () => {
  log.info(`🚀  FocusFlow API  →  http://localhost:${port}`);
  log.info(`📖  API Docs       →  http://localhost:${port}/openapi.json`);
  log.info(`🩺  Health         →  http://localhost:${port}/health/detail`);
  log.info(`👤  Test user      →  test@focusflow.app / Test123456`);
});

export default app;
export { app };
