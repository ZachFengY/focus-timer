import { describe, it, expect } from "vitest";

import { hashPassword, verifyPassword } from "../../utils/crypto";

describe("hashPassword", () => {
  it("produces a non-empty hash", () => {
    const hash = hashPassword("Test123456");
    expect(hash).toBeTruthy();
    expect(hash).toContain(":");
  });

  it("produces different hashes for same password (salt is random)", () => {
    const h1 = hashPassword("Test123456");
    const h2 = hashPassword("Test123456");
    expect(h1).not.toBe(h2);
  });
});

describe("verifyPassword", () => {
  it("returns true for correct password", () => {
    const hash = hashPassword("Test123456");
    expect(verifyPassword("Test123456", hash)).toBe(true);
  });

  it("returns false for wrong password", () => {
    const hash = hashPassword("Test123456");
    expect(verifyPassword("WrongPass", hash)).toBe(false);
  });

  it("returns false for malformed hash", () => {
    expect(verifyPassword("Test123456", "not-a-valid-hash")).toBe(false);
  });
});
