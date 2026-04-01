import { OpenAPIHono } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import { db } from "../db/memory-store";
import { hashPassword, verifyPassword } from "../utils/crypto";
import { signToken } from "../utils/jwt";
import { log } from "../utils/logger";

export const authRouter = new OpenAPIHono();

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// ─── POST /auth/sign-up ────────────────────────────────────────────────────────
authRouter.post("/sign-up", async (c) => {
  const body = CredentialsSchema.parse(await c.req.json());
  const requestId = c.req.header("x-request-id") ?? "unknown";

  // Check duplicate email
  const existing = db.findOne(db.users, (u) => u.email === body.email);
  if (existing) {
    log.warn({ requestId, email: body.email }, "Sign-up: email already exists");
    throw new HTTPException(409, { message: "Email already registered" });
  }

  const user = {
    id: db.newId(),
    email: body.email,
    passwordHash: hashPassword(body.password),
    createdAt: db.now(),
  };
  db.users.set(user.id, user);

  const token = await signToken({ userId: user.id });

  log.info({ requestId, userId: user.id }, "✓ User registered");

  return c.json(
    {
      data: {
        token,
        user: { id: user.id, email: user.email },
      },
    },
    201,
  );
});

// ─── POST /auth/sign-in ────────────────────────────────────────────────────────
authRouter.post("/sign-in", async (c) => {
  const body = CredentialsSchema.parse(await c.req.json());
  const requestId = c.req.header("x-request-id") ?? "unknown";

  const user = db.findOne(db.users, (u) => u.email === body.email);

  // Constant-time response to prevent email enumeration
  if (!user || !verifyPassword(body.password, user.passwordHash)) {
    log.warn(
      { requestId, email: body.email },
      "Sign-in failed: bad credentials",
    );
    throw new HTTPException(401, { message: "Invalid email or password" });
  }

  const token = await signToken({ userId: user.id });
  log.info({ requestId, userId: user.id }, "✓ User signed in");

  return c.json({
    data: {
      token,
      user: { id: user.id, email: user.email },
    },
  });
});

// ─── GET /auth/me ──────────────────────────────────────────────────────────────
authRouter.get("/me", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Not authenticated" });
  }

  const { verifyToken } = await import("../utils/jwt");
  const { userId } = await verifyToken(authHeader.slice(7)).catch(() => {
    throw new HTTPException(401, { message: "Invalid token" });
  });

  const user = db.users.get(userId);
  if (!user) throw new HTTPException(404, { message: "User not found" });

  return c.json({ data: { id: user.id, email: user.email } });
});
