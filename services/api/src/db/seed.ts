/**
 * Seed data for local development.
 * Creates one test user + realistic sample data so the app
 * has something to display immediately on first boot.
 *
 * Test credentials:
 *   email:    test@focusflow.app
 *   password: Test123456
 */
import { hashPassword } from "../utils/crypto";
import { log } from "../utils/logger";

import { db } from "./memory-store";

export function seedDatabase(): void {
  if (db.users.size > 0) return; // already seeded

  const userId = "seed-user-001";
  const now = Date.now();
  const DAY = 86_400_000;

  // ── User ────────────────────────────────────────────────────────────────────
  db.users.set(userId, {
    id: userId,
    email: "test@focusflow.app",
    passwordHash: hashPassword("Test123456"),
    createdAt: now - 30 * DAY,
  });

  // ── Subjects ────────────────────────────────────────────────────────────────
  const subjects = [
    { id: "sub-coding", name: "编程", color: "#6366F1" },
    { id: "sub-design", name: "设计", color: "#32D583" },
    { id: "sub-reading", name: "阅读", color: "#E85A4F" },
    { id: "sub-fitness", name: "健身", color: "#FFB547" },
  ];

  for (const s of subjects) {
    db.subjects.set(s.id, {
      ...s,
      userId,
      icon: null,
      isDeleted: false,
      createdAt: now - 30 * DAY,
      updatedAt: now - 30 * DAY,
    });
  }

  // ── Time Records (last 7 days) ───────────────────────────────────────────────
  const records = [
    // Today
    { subjectId: "sub-coding", duration: 5400, daysAgo: 0, hour: 9 },
    { subjectId: "sub-reading", duration: 2700, daysAgo: 0, hour: 14 },
    // Yesterday
    { subjectId: "sub-coding", duration: 7200, daysAgo: 1, hour: 10 },
    { subjectId: "sub-design", duration: 3600, daysAgo: 1, hour: 15 },
    // Day -2
    { subjectId: "sub-coding", duration: 4800, daysAgo: 2, hour: 9 },
    { subjectId: "sub-fitness", duration: 3000, daysAgo: 2, hour: 7 },
    // Day -3
    { subjectId: "sub-reading", duration: 3600, daysAgo: 3, hour: 20 },
    { subjectId: "sub-design", duration: 5400, daysAgo: 3, hour: 14 },
    // Day -4
    { subjectId: "sub-coding", duration: 9000, daysAgo: 4, hour: 9 },
    // Day -5
    { subjectId: "sub-coding", duration: 3600, daysAgo: 5, hour: 11 },
    { subjectId: "sub-fitness", duration: 2700, daysAgo: 5, hour: 7 },
    // Day -6
    { subjectId: "sub-design", duration: 7200, daysAgo: 6, hour: 13 },
  ];

  for (let i = 0; i < records.length; i++) {
    const r = records[i]!;
    const startTime = now - r.daysAgo * DAY - (now % DAY) + r.hour * 3600_000;
    const id = `rec-${String(i).padStart(3, "0")}`;

    db.timeRecords.set(id, {
      id,
      userId,
      subjectId: r.subjectId,
      mode: "countup",
      duration: r.duration,
      startTime,
      endTime: startTime + r.duration * 1000,
      createdAt: startTime,
    });
  }

  // ── Goals ───────────────────────────────────────────────────────────────────
  const goals = [
    {
      id: "goal-01",
      type: "daily" as const,
      targetDuration: 10800,
      subjectId: "sub-coding",
    }, // 3h coding/day
    {
      id: "goal-02",
      type: "weekly" as const,
      targetDuration: 36000,
      subjectId: null,
    }, // 10h total/week
    {
      id: "goal-03",
      type: "monthly" as const,
      targetDuration: 72000,
      subjectId: "sub-reading",
    }, // 20h reading/month
  ];

  for (const g of goals) {
    db.goals.set(g.id, {
      ...g,
      userId,
      createdAt: now - 7 * DAY,
      updatedAt: now - 7 * DAY,
    });
  }

  log.info(
    { userId, subjects: subjects.length, records: records.length },
    "🌱 Database seeded",
  );
}
