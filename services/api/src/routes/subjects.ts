import { CreateSubjectSchema, UpdateSubjectSchema } from "@focusflow/types";
import { OpenAPIHono } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";

import { db } from "../db/memory-store";
import type { AuthContext } from "../middleware/auth";
import { createLogger } from "../utils/logger";

const log = createLogger({ route: "subjects" });
export const subjectsRouter = new OpenAPIHono<AuthContext>();

subjectsRouter.get("/", (c) => {
  const userId = c.get("userId");
  const subjects = db
    .findMany(db.subjects, (s) => s.userId === userId && !s.isDeleted)
    .sort((a, b) => a.createdAt - b.createdAt);
  return c.json({ data: subjects });
});

subjectsRouter.post("/", async (c) => {
  const userId = c.get("userId");
  const body = CreateSubjectSchema.parse(await c.req.json());

  const subject = {
    id: db.newId(),
    userId,
    name: body.name,
    color: body.color ?? null,
    icon: body.icon ?? null,
    isDeleted: false,
    createdAt: db.now(),
    updatedAt: db.now(),
  };
  db.subjects.set(subject.id, subject);
  log.info({ userId, subjectId: subject.id }, "✓ Subject created");
  return c.json({ data: subject }, 201);
});

subjectsRouter.patch("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const body = UpdateSubjectSchema.parse(await c.req.json());

  const subject = db.subjects.get(id);
  if (!subject) throw new HTTPException(404, { message: "Subject not found" });
  if (subject.userId !== userId)
    throw new HTTPException(403, { message: "Forbidden" });

  const updated = { ...subject, ...body, updatedAt: db.now() };
  db.subjects.set(id, updated);
  return c.json({ data: updated });
});

subjectsRouter.delete("/:id", (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  const subject = db.subjects.get(id);
  if (!subject) throw new HTTPException(404, { message: "Subject not found" });
  if (subject.userId !== userId)
    throw new HTTPException(403, { message: "Forbidden" });

  // Soft delete — historical records remain intact
  db.subjects.set(id, { ...subject, isDeleted: true, updatedAt: db.now() });
  log.info({ userId, subjectId: id }, "✓ Subject soft-deleted");
  return c.json({ data: { id } });
});
