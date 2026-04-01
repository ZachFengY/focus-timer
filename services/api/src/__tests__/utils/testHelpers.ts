/**
 * Test helpers — shared utilities to DRY up test files.
 *
 * createTestUser()  — inserts a user + returns token
 * createTestApp()   — returns the Hono app instance
 * req()             — typed fetch wrapper for route testing
 */
import { db } from "../../db/memory-store";
import { app } from "../../index";
import { hashPassword } from "../../utils/crypto";
import { signToken } from "../../utils/jwt";

export interface TestUser {
  id: string;
  email: string;
  token: string;
}

export async function createTestUser(overrides?: {
  email?: string;
  password?: string;
}): Promise<TestUser> {
  const email = overrides?.email ?? "user@test.com";
  const id = db.newId();

  db.users.set(id, {
    id,
    email,
    passwordHash: hashPassword(overrides?.password ?? "Test123456"),
    createdAt: Date.now(),
  });

  const token = await signToken({ userId: id });
  return { id, email, token };
}

export function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/**
 * Typed test request helper.
 * Usage:
 *   const res = await req('POST', '/auth/sign-in', { email, password })
 *   expect(res.status).toBe(200)
 */
export async function req(
  method: string,
  path: string,
  body?: unknown,
  headers?: Record<string, string>,
): Promise<Response> {
  return app.request(path, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
}
