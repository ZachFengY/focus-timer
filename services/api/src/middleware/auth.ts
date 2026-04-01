import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import { verifyToken } from "../utils/jwt";
import { log } from "../utils/logger";

export type AuthContext = {
  Variables: {
    userId: string;
  };
};

export const authMiddleware = createMiddleware<AuthContext>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const requestId = c.req.header("x-request-id") ?? "unknown";

  if (!authHeader?.startsWith("Bearer ")) {
    log.warn(
      { requestId, path: c.req.path },
      "Auth failed: missing Bearer token",
    );
    throw new HTTPException(401, { message: "Missing authorization token" });
  }

  const token = authHeader.slice(7);

  try {
    const { userId } = await verifyToken(token);
    c.set("userId", userId);
    log.debug({ requestId, userId }, "Auth OK");
    await next();
  } catch (err) {
    log.warn({ requestId, err }, "Auth failed: invalid or expired token");
    throw new HTTPException(401, { message: "Invalid or expired token" });
  }
});
