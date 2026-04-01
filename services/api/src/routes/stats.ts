import { StatRangeSchema } from "@focusflow/types";
import { OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";

import type { AuthContext } from "../middleware/auth";
import { StatsService } from "../services/statsService";

export const statsRouter = new OpenAPIHono<AuthContext>();
const service = new StatsService();

statsRouter.get("/", async (c) => {
  const userId = c.get("userId");
  const range = StatRangeSchema.catch("week").parse(c.req.query("range"));
  const data = await service.getStats(userId, range);
  return c.json({ data });
});

statsRouter.get("/calendar", async (c) => {
  const userId = c.get("userId");
  const year = z.coerce
    .number()
    .int()
    .parse(c.req.query("year") ?? new Date().getFullYear());
  const month = z.coerce
    .number()
    .int()
    .min(1)
    .max(12)
    .parse(c.req.query("month") ?? new Date().getMonth() + 1);
  const data = await service.getCalendar(userId, year, month);
  return c.json({ data });
});
