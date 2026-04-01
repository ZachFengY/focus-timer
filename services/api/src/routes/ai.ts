import { AiAnalysisRequestSchema } from "@focusflow/types";
import { OpenAPIHono } from "@hono/zod-openapi";

import type { AuthContext } from "../middleware/auth";
import { AiService } from "../services/aiService";

export const aiRouter = new OpenAPIHono<AuthContext>();
const service = new AiService();

aiRouter.post("/analyze", async (c) => {
  const userId = c.get("userId");
  const body = AiAnalysisRequestSchema.parse(await c.req.json());
  const data = await service.analyze(userId, body.range);
  return c.json({ data });
});
