import { describe, it, expect } from "vitest";

import { db } from "../../db/memory-store";
import { authHeaders, createTestUser, req } from "../utils/testHelpers";

const validRecord = () => ({
  subjectId: null,
  mode: "countup" as const,
  duration: 3600,
  startTime: Date.now() - 3_600_000,
  endTime: Date.now(),
  pauses: [],
});

describe("POST /v1/time-records", () => {
  it("creates a time record", async () => {
    const { token } = await createTestUser();
    const res = await req(
      "POST",
      "/v1/time-records",
      validRecord(),
      authHeaders(token),
    );
    expect(res.status).toBe(201);

    const body = (await res.json()) as {
      data: { duration: number; mode: string };
    };
    expect(body.data.duration).toBe(3600);
    expect(body.data.mode).toBe("countup");
    expect(db.timeRecords.size).toBe(1);
  });

  it("stores pauses correctly", async () => {
    const { token } = await createTestUser();
    const now = Date.now();
    const record = {
      ...validRecord(),
      pauses: [{ startTime: now - 2000, endTime: now - 1000 }],
    };
    const res = await req(
      "POST",
      "/v1/time-records",
      record,
      authHeaders(token),
    );
    expect(res.status).toBe(201);

    const body = (await res.json()) as { data: { pauses: unknown[] } };
    expect(body.data.pauses).toHaveLength(1);
    expect(db.pauseRecords.size).toBe(1);
  });

  it("returns 422 for duration < 1", async () => {
    const { token } = await createTestUser();
    const res = await req(
      "POST",
      "/v1/time-records",
      { ...validRecord(), duration: 0 },
      authHeaders(token),
    );
    expect(res.status).toBe(422);
  });

  it("requires auth", async () => {
    const res = await req("POST", "/v1/time-records", validRecord());
    expect(res.status).toBe(401);
  });
});

describe("GET /v1/time-records", () => {
  it("returns only records belonging to the authenticated user", async () => {
    const user1 = await createTestUser({ email: "u1@test.com" });
    const user2 = await createTestUser({ email: "u2@test.com" });

    // User 1 creates 2 records
    await req(
      "POST",
      "/v1/time-records",
      validRecord(),
      authHeaders(user1.token),
    );
    await req(
      "POST",
      "/v1/time-records",
      validRecord(),
      authHeaders(user1.token),
    );
    // User 2 creates 1 record
    await req(
      "POST",
      "/v1/time-records",
      validRecord(),
      authHeaders(user2.token),
    );

    const res = await req(
      "GET",
      "/v1/time-records",
      undefined,
      authHeaders(user1.token),
    );
    const body = (await res.json()) as { data: unknown[] };
    expect(body.data).toHaveLength(2);
  });

  it("paginates correctly", async () => {
    const { token } = await createTestUser();
    for (let i = 0; i < 5; i++) {
      await req("POST", "/v1/time-records", validRecord(), authHeaders(token));
    }
    const res = await req(
      "GET",
      "/v1/time-records?limit=3&page=1",
      undefined,
      authHeaders(token),
    );
    const body = (await res.json()) as { data: unknown[] };
    expect(body.data).toHaveLength(3);
  });
});

describe("DELETE /v1/time-records/:id", () => {
  it("deletes own record and cascades pauses", async () => {
    const { token } = await createTestUser();
    const createRes = await req(
      "POST",
      "/v1/time-records",
      {
        ...validRecord(),
        pauses: [{ startTime: Date.now() - 2000, endTime: Date.now() - 1000 }],
      },
      authHeaders(token),
    );
    const { data } = (await createRes.json()) as { data: { id: string } };

    expect(db.pauseRecords.size).toBe(1);

    const del = await req(
      "DELETE",
      `/v1/time-records/${data.id}`,
      undefined,
      authHeaders(token),
    );
    expect(del.status).toBe(200);
    expect(db.timeRecords.size).toBe(0);
    expect(db.pauseRecords.size).toBe(0);
  });

  it("returns 403 when deleting another user's record", async () => {
    const u1 = await createTestUser({ email: "u1@test.com" });
    const u2 = await createTestUser({ email: "u2@test.com" });

    const createRes = await req(
      "POST",
      "/v1/time-records",
      validRecord(),
      authHeaders(u1.token),
    );
    const { data } = (await createRes.json()) as { data: { id: string } };

    const del = await req(
      "DELETE",
      `/v1/time-records/${data.id}`,
      undefined,
      authHeaders(u2.token),
    );
    expect(del.status).toBe(403);
    expect(db.timeRecords.size).toBe(1); // not deleted
  });
});
