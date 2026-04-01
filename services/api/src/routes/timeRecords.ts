import { CreateTimeRecordSchema, TimeRecordSchema } from "@focusflow/types";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

import type { AuthContext } from "../middleware/auth";
import { TimeRecordService } from "../services/timeRecordService";

export const timeRecordsRouter = new OpenAPIHono<AuthContext>();
const service = new TimeRecordService();

// ─── POST /time-records ────────────────────────────────────────────────────────
const createRoute_ = createRoute({
  method: "post",
  path: "/",
  tags: ["Time Records"],
  request: {
    body: {
      content: { "application/json": { schema: CreateTimeRecordSchema } },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": { schema: z.object({ data: TimeRecordSchema }) },
      },
      description: "Created",
    },
  },
});

timeRecordsRouter.openapi(createRoute_, async (c) => {
  const userId = c.get("userId");
  const body = c.req.valid("json");
  const record = await service.create(userId, body);
  return c.json({ data: record }, 201);
});

// ─── GET /time-records ─────────────────────────────────────────────────────────
const listRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Time Records"],
  request: {
    query: z.object({
      subjectId: z.string().uuid().optional(),
      limit: z.coerce.number().int().positive().max(100).default(20),
      page: z.coerce.number().int().positive().default(1),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ data: z.array(TimeRecordSchema) }),
        },
      },
      description: "List of time records",
    },
  },
});

timeRecordsRouter.openapi(listRoute, async (c) => {
  const userId = c.get("userId");
  const query = c.req.valid("query");
  const records = await service.list(userId, query);
  return c.json({ data: records });
});

// ─── DELETE /time-records/:id ──────────────────────────────────────────────────
const deleteRoute = createRoute({
  method: "delete",
  path: "/:id",
  tags: ["Time Records"],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ data: z.object({ id: z.string() }) }),
        },
      },
      description: "Deleted",
    },
  },
});

timeRecordsRouter.openapi(deleteRoute, async (c) => {
  const userId = c.get("userId");
  const { id } = c.req.valid("param");
  await service.delete(userId, id);
  return c.json({ data: { id } });
});
