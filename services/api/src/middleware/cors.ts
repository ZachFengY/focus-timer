import { cors } from "hono/cors";

export const corsMiddleware = cors({
  origin: (origin) => {
    const allowed = [
      "http://localhost:8081", // Expo web
      "http://localhost:3001", // Next.js (future web app)
      /\.focusflow\.app$/, // Production domains
    ];
    return allowed.some((p) =>
      typeof p === "string" ? p === origin : p.test(origin ?? ""),
    )
      ? origin
      : null;
  },
  allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
});
