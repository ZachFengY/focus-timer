import { jwtVerify, SignJWT } from "jose";

const rawSecret =
  process.env["JWT_SECRET"] ?? "focusflow-local-dev-secret-32chars!";
const secret = new TextEncoder().encode(rawSecret);

if (rawSecret.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters");
}

export async function signToken(payload: { userId: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<{ userId: string }> {
  const { payload } = await jwtVerify(token, secret);
  if (typeof payload["userId"] !== "string") {
    throw new Error("Invalid token payload");
  }
  return { userId: payload["userId"] };
}
