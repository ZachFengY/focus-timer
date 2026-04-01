import { describe, it, expect } from "vitest";

import { db } from "../../db/memory-store";
import { req, createTestUser } from "../utils/testHelpers";

describe("POST /auth/sign-up", () => {
  it("creates a new user and returns token", async () => {
    const res = await req("POST", "/auth/sign-up", {
      email: "new@test.com",
      password: "Test123456",
    });
    expect(res.status).toBe(201);

    const body = (await res.json()) as {
      data: { token: string; user: { email: string } };
    };
    expect(body.data.token).toBeTruthy();
    expect(body.data.user.email).toBe("new@test.com");
    expect(db.users.size).toBe(1);
  });

  it("returns 409 if email already exists", async () => {
    await req("POST", "/auth/sign-up", {
      email: "dup@test.com",
      password: "Test123456",
    });
    const res = await req("POST", "/auth/sign-up", {
      email: "dup@test.com",
      password: "Test123456",
    });
    expect(res.status).toBe(409);
  });

  it("returns 422 for invalid email", async () => {
    const res = await req("POST", "/auth/sign-up", {
      email: "not-an-email",
      password: "Test123456",
    });
    expect(res.status).toBe(422);
  });

  it("returns 422 for short password", async () => {
    const res = await req("POST", "/auth/sign-up", {
      email: "a@b.com",
      password: "123",
    });
    expect(res.status).toBe(422);
  });
});

describe("POST /auth/sign-in", () => {
  it("returns token with valid credentials", async () => {
    await req("POST", "/auth/sign-up", {
      email: "login@test.com",
      password: "Test123456",
    });
    const res = await req("POST", "/auth/sign-in", {
      email: "login@test.com",
      password: "Test123456",
    });
    expect(res.status).toBe(200);

    const body = (await res.json()) as { data: { token: string } };
    expect(body.data.token).toBeTruthy();
  });

  it("returns 401 for wrong password", async () => {
    await req("POST", "/auth/sign-up", {
      email: "a@b.com",
      password: "Test123456",
    });
    const res = await req("POST", "/auth/sign-in", {
      email: "a@b.com",
      password: "WrongPass1",
    });
    expect(res.status).toBe(401);
  });

  it("returns 401 for unknown email", async () => {
    const res = await req("POST", "/auth/sign-in", {
      email: "ghost@test.com",
      password: "Test123456",
    });
    expect(res.status).toBe(401);
  });
});

describe("Protected routes", () => {
  it("returns 401 without token", async () => {
    const res = await req("GET", "/v1/subjects");
    expect(res.status).toBe(401);
  });

  it("returns 401 with malformed token", async () => {
    const res = await req("GET", "/v1/subjects", undefined, {
      Authorization: "Bearer not.a.token",
    });
    expect(res.status).toBe(401);
  });

  it("GET /auth/me returns user info with valid token", async () => {
    const { token, email } = await createTestUser({ email: "me@test.com" });
    const res = await req("GET", "/auth/me", undefined, {
      Authorization: `Bearer ${token}`,
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { email: string } };
    expect(body.data.email).toBe(email);
  });
});
