import { describe, it, expect, beforeEach } from "vitest";

import { db } from "../../db/memory-store";
import { StatsService } from "../../services/statsService";

const service = new StatsService();
const userId = "test-user";

beforeEach(() => {
  // Insert a user so FK constraints would pass (memory store doesn't enforce FKs)
  db.users.set(userId, {
    id: userId,
    email: "u@test.com",
    passwordHash: "x",
    createdAt: Date.now(),
  });
});

function addRecord(
  daysAgo: number,
  duration: number,
  subjectId: string | null = null,
) {
  const id = db.newId();
  const start = Date.now() - daysAgo * 86_400_000;
  db.timeRecords.set(id, {
    id,
    userId,
    subjectId,
    mode: "countup",
    duration,
    startTime: start,
    endTime: start + duration * 1000,
    createdAt: start,
  });
}

describe("StatsService.getStats()", () => {
  it("returns zero summary for user with no records", async () => {
    const stats = await service.getStats(userId, "week");
    expect(stats.summary.totalDuration).toBe(0);
    expect(stats.summary.recordCount).toBe(0);
    expect(stats.summary.streak).toBe(0);
  });

  it("sums durations correctly", async () => {
    addRecord(0, 3600); // today: 1h
    addRecord(0, 1800); // today: 30m
    addRecord(1, 7200); // yesterday: 2h

    const stats = await service.getStats(userId, "week");
    expect(stats.summary.totalDuration).toBe(3600 + 1800 + 7200);
    expect(stats.summary.recordCount).toBe(3);
  });

  it("groups by subject correctly", async () => {
    const subId = "sub-1";
    db.subjects.set(subId, {
      id: subId,
      userId,
      name: "编程",
      color: "#6366F1",
      icon: null,
      isDeleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    addRecord(0, 3600, subId);
    addRecord(0, 1800, null);

    const stats = await service.getStats(userId, "week");
    expect(stats.bySubject).toHaveLength(2);

    const coding = stats.bySubject.find((s) => s.subjectName === "编程");
    expect(coding?.duration).toBe(3600);
    expect(coding?.percentage).toBe(66.7);
  });

  it("does not include records outside the range", async () => {
    addRecord(0, 3600); // today — in range
    addRecord(10, 7200); // 10 days ago — outside week range

    const weekStats = await service.getStats(userId, "week");
    expect(weekStats.summary.totalDuration).toBe(3600);
  });

  it("calculates streak correctly", async () => {
    addRecord(0, 3600);
    addRecord(1, 3600);
    addRecord(2, 3600);
    // gap at day 3
    addRecord(4, 3600);

    const stats = await service.getStats(userId, "week");
    expect(stats.summary.streak).toBe(3); // consecutive days up to today
  });
});

describe("StatsService.getCalendar()", () => {
  it("returns correct number of days", async () => {
    const cal = await service.getCalendar(userId, 2025, 3); // March 2025 = 31 days
    expect(cal).toHaveLength(31);
  });

  it("marks days with records correctly", async () => {
    const march15 = new Date(2025, 2, 15).getTime();
    db.timeRecords.set("r1", {
      id: "r1",
      userId,
      subjectId: null,
      mode: "countup",
      duration: 3600,
      startTime: march15,
      endTime: march15 + 3_600_000,
      createdAt: march15,
    });

    const cal = await service.getCalendar(userId, 2025, 3);
    const day15 = cal.find((d) => d.date === "2025-03-15");
    expect(day15?.hasRecords).toBe(true);
    expect(day15?.totalDuration).toBe(3600);
  });
});
