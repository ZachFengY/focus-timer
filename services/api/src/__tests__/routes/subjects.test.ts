import { describe, it, expect } from "vitest";

import { db } from "../../db/memory-store";
import { authHeaders, createTestUser, req } from "../utils/testHelpers";

describe("Subjects CRUD", () => {
  it("creates a subject", async () => {
    const { token } = await createTestUser();
    const res = await req(
      "POST",
      "/v1/subjects",
      { name: "编程", color: "#6366F1" },
      authHeaders(token),
    );
    expect(res.status).toBe(201);

    const body = (await res.json()) as {
      data: { name: string; color: string };
    };
    expect(body.data.name).toBe("编程");
    expect(body.data.color).toBe("#6366F1");
  });

  it("lists only own non-deleted subjects", async () => {
    const u1 = await createTestUser({ email: "u1@test.com" });
    const u2 = await createTestUser({ email: "u2@test.com" });

    await req("POST", "/v1/subjects", { name: "S1" }, authHeaders(u1.token));
    await req("POST", "/v1/subjects", { name: "S2" }, authHeaders(u1.token));
    await req("POST", "/v1/subjects", { name: "S3" }, authHeaders(u2.token));

    const res = await req(
      "GET",
      "/v1/subjects",
      undefined,
      authHeaders(u1.token),
    );
    const body = (await res.json()) as { data: unknown[] };
    expect(body.data).toHaveLength(2);
  });

  it("updates a subject", async () => {
    const { token } = await createTestUser();
    const createRes = await req(
      "POST",
      "/v1/subjects",
      { name: "Old" },
      authHeaders(token),
    );
    const { data } = (await createRes.json()) as { data: { id: string } };

    const patchRes = await req(
      "PATCH",
      `/v1/subjects/${data.id}`,
      { name: "New", color: "#32D583" },
      authHeaders(token),
    );
    expect(patchRes.status).toBe(200);

    const body = (await patchRes.json()) as { data: { name: string } };
    expect(body.data.name).toBe("New");
  });

  it("soft-deletes a subject (isDeleted=true, not removed)", async () => {
    const { token } = await createTestUser();
    const createRes = await req(
      "POST",
      "/v1/subjects",
      { name: "ToDelete" },
      authHeaders(token),
    );
    const { data } = (await createRes.json()) as { data: { id: string } };

    await req(
      "DELETE",
      `/v1/subjects/${data.id}`,
      undefined,
      authHeaders(token),
    );

    // Subject still in store (soft delete)
    const subject = db.subjects.get(data.id);
    expect(subject).toBeTruthy();
    expect(subject?.isDeleted).toBe(true);

    // But not in list
    const listRes = await req(
      "GET",
      "/v1/subjects",
      undefined,
      authHeaders(token),
    );
    const body = (await listRes.json()) as { data: unknown[] };
    expect(body.data).toHaveLength(0);
  });

  it("returns 403 editing another user's subject", async () => {
    const u1 = await createTestUser({ email: "u1@test.com" });
    const u2 = await createTestUser({ email: "u2@test.com" });

    const createRes = await req(
      "POST",
      "/v1/subjects",
      { name: "Private" },
      authHeaders(u1.token),
    );
    const { data } = (await createRes.json()) as { data: { id: string } };

    const res = await req(
      "PATCH",
      `/v1/subjects/${data.id}`,
      { name: "Hacked" },
      authHeaders(u2.token),
    );
    expect(res.status).toBe(403);
  });
});
