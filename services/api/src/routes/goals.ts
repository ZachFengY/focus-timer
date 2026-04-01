import { CreateGoalSchema, UpdateGoalSchema } from "@focusflow/types";
import { OpenAPIHono } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";

import { db } from "../db/memory-store";
import type { AuthContext } from "../middleware/auth";
import { createLogger } from "../utils/logger";

const log = createLogger({ route: "goals" });
export const goalsRouter = new OpenAPIHono<AuthContext>();

/** Compute actual progress for a goal based on current period records. */
function computeProgress(goalId: string, userId: string) {
  const goal = db.goals.get(goalId);
  if (!goal) return null;

  const now = Date.now();
  let periodStart: number;
  switch (goal.type) {
    case "daily":
      periodStart = new Date().setHours(0, 0, 0, 0);
      break;
    case "weekly":
      periodStart = now - ((new Date().getDay() || 7) - 1) * 86_400_000;
      break;
    case "monthly":
      periodStart = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      ).getTime();
      break;
    default:
      periodStart = 0;
  }

  const records = db.findMany(
    db.timeRecords,
    (r) =>
      r.userId === userId &&
      r.startTime >= periodStart &&
      (!goal.subjectId || r.subjectId === goal.subjectId),
  );

  const actualDuration = records.reduce((s, r) => s + r.duration, 0);
  const progress = Math.min(actualDuration / goal.targetDuration, 1);
  const subject = goal.subjectId ? db.subjects.get(goal.subjectId) : null;

  return {
    ...goal,
    actualDuration,
    progress,
    isCompleted: actualDuration >= goal.targetDuration,
    subjectName: subject?.name ?? null,
    subjectColor: subject?.color ?? null,
  };
}

goalsRouter.get("/", (c) => {
  const userId = c.get("userId");
  const goals = db
    .findMany(db.goals, (g) => g.userId === userId)
    .map((g) => computeProgress(g.id, userId))
    .filter(Boolean);
  return c.json({ data: goals });
});

goalsRouter.post("/", async (c) => {
  const userId = c.get("userId");
  const body = CreateGoalSchema.parse(await c.req.json());
  const goal = {
    id: db.newId(),
    userId,
    type: body.type,
    targetDuration: body.targetDuration,
    subjectId: body.subjectId ?? null,
    createdAt: db.now(),
    updatedAt: db.now(),
  };
  db.goals.set(goal.id, goal);
  log.info({ userId, goalId: goal.id, type: goal.type }, "✓ Goal created");
  return c.json({ data: computeProgress(goal.id, userId) }, 201);
});

goalsRouter.patch("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const body = UpdateGoalSchema.parse(await c.req.json());

  const goal = db.goals.get(id);
  if (!goal) throw new HTTPException(404, { message: "Goal not found" });
  if (goal.userId !== userId)
    throw new HTTPException(403, { message: "Forbidden" });

  const updated = { ...goal, ...body, updatedAt: db.now() };
  db.goals.set(id, updated);
  return c.json({ data: computeProgress(id, userId) });
});

goalsRouter.delete("/:id", (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  const goal = db.goals.get(id);
  if (!goal) throw new HTTPException(404, { message: "Goal not found" });
  if (goal.userId !== userId)
    throw new HTTPException(403, { message: "Forbidden" });

  db.goals.delete(id);
  return c.json({ data: { id } });
});
