/**
 * Structured logger — Pino with pretty-print in dev, JSON in prod.
 *
 * Usage:
 *   log.info({ userId, duration }, 'Timer saved')
 *   log.error({ err, requestId }, 'DB write failed')
 *
 * In tests: set LOG_LEVEL=silent to suppress output.
 */
import pino from "pino";

const isDev = process.env["NODE_ENV"] !== "production";
const level = process.env["LOG_LEVEL"] ?? (isDev ? "debug" : "info");

export const log = pino({
  level,
  ...(isDev && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname",
        messageFormat: "{msg} {requestId}",
      },
    },
  }),
  base: {
    env: process.env["NODE_ENV"] ?? "development",
    version: process.env["npm_package_version"] ?? "0.0.0",
  },
  redact: {
    // Never log sensitive fields
    paths: [
      "*.password",
      "*.passwordHash",
      "*.token",
      "*.accessToken",
      "req.headers.authorization",
    ],
    censor: "[REDACTED]",
  },
  serializers: {
    err: pino.stdSerializers.err,
    req: (req: {
      method: string;
      url: string;
      headers: Record<string, string>;
    }) => ({
      method: req.method,
      url: req.url,
      requestId: req.headers["x-request-id"],
    }),
  },
});

/** Child logger with fixed context — use in services for scoped logs. */
export function createLogger(context: Record<string, unknown>) {
  return log.child(context);
}
