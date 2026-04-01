/**
 * Global test setup — runs before every test file.
 * Clears the in-memory store so tests are isolated.
 */
import { beforeEach } from "vitest";

import { db } from "../db/memory-store";

beforeEach(() => {
  db.clear();
});
