import type { CalendarDay, StatsResponse, StatRange } from "@focusflow/types";

import { db } from "../db/memory-store";
import { createLogger } from "../utils/logger";

const log = createLogger({ service: "StatsService" });

export class StatsService {
  async getStats(userId: string, range: StatRange): Promise<StatsResponse> {
    const { startMs, endMs, startDate, endDate } = this.getRange(range);
    log.debug({ userId, range, startDate, endDate }, "Computing stats");

    const records = db.recordsInRange(userId, startMs, endMs);

    const totalDuration = records.reduce((s, r) => s + r.duration, 0);
    const streak = db.calcStreak(userId);

    // By-subject aggregation
    const subjectMap = new Map<
      string | null,
      { duration: number; count: number }
    >();
    for (const r of records) {
      const key = r.subjectId;
      const curr = subjectMap.get(key) ?? { duration: 0, count: 0 };
      subjectMap.set(key, {
        duration: curr.duration + r.duration,
        count: curr.count + 1,
      });
    }

    const bySubject = [...subjectMap.entries()]
      .map(([id, { duration, count }]) => {
        const subject = id ? db.subjects.get(id) : null;
        return {
          subjectId: id,
          subjectName: subject?.name ?? "未分类",
          subjectColor: subject?.color ?? "#8E8E93",
          duration,
          percentage:
            totalDuration > 0
              ? Math.round((duration / totalDuration) * 1000) / 10
              : 0,
          recordCount: count,
        };
      })
      .sort((a, b) => b.duration - a.duration);

    // By-day aggregation
    const dayMap = new Map<string, number>();
    for (const r of records) {
      const dateKey = new Date(r.startTime).toISOString().split("T")[0]!;
      dayMap.set(dateKey, (dayMap.get(dateKey) ?? 0) + r.duration);
    }

    const byDay = [...dayMap.entries()]
      .map(([date, duration]) => ({
        date,
        duration,
        recordCount: records.filter(
          (r) => r.startTime >= new Date(date + "T00:00:00").getTime(),
        ).length,
        subjects: [],
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const dayCount = Math.max(1, (endMs - startMs) / 86_400_000);
    const dailyValues = [...dayMap.values()];

    return {
      range,
      startDate,
      endDate,
      summary: {
        totalDuration,
        avgDailyDuration: Math.round(totalDuration / dayCount),
        maxDailyDuration: dailyValues.length > 0 ? Math.max(...dailyValues) : 0,
        streak,
        longestStreak: streak, // simplified for local dev
        recordCount: records.length,
      },
      bySubject,
      byDay,
    };
  }

  async getCalendar(
    userId: string,
    year: number,
    month: number,
  ): Promise<CalendarDay[]> {
    const startMs = new Date(year, month - 1, 1).getTime();
    const endMs = new Date(year, month, 0, 23, 59, 59).getTime();
    const records = db.recordsInRange(userId, startMs, endMs);

    const dayMap = new Map<
      string,
      { duration: number; subjectIds: string[] }
    >();
    for (const r of records) {
      const key = new Date(r.startTime).toISOString().split("T")[0]!;
      const curr = dayMap.get(key) ?? { duration: 0, subjectIds: [] };
      dayMap.set(key, {
        duration: curr.duration + r.duration,
        subjectIds: r.subjectId
          ? [...curr.subjectIds, r.subjectId]
          : curr.subjectIds,
      });
    }

    const days: CalendarDay[] = [];
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayData = dayMap.get(date);
      days.push({
        date,
        totalDuration: dayData?.duration ?? 0,
        hasRecords: !!dayData,
        subjects: (dayData?.subjectIds ?? [])
          .filter((id, i, arr) => arr.indexOf(id) === i)
          .map((id) => ({
            color: db.subjects.get(id)?.color ?? "#8E8E93",
            duration: records
              .filter((r) => r.subjectId === id)
              .reduce((s, r) => s + r.duration, 0),
          })),
      });
    }
    return days;
  }

  private getRange(range: StatRange): {
    startMs: number;
    endMs: number;
    startDate: string;
    endDate: string;
  } {
    const now = new Date();
    const endDate = now.toISOString().split("T")[0]!;
    const endMs = now.getTime();
    let startMs: number;

    switch (range) {
      case "day":
        startMs = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        ).getTime();
        break;
      case "week":
        startMs = endMs - 6 * 86_400_000;
        break;
      case "month":
        startMs = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        break;
      case "year":
        startMs = new Date(now.getFullYear(), 0, 1).getTime();
        break;
    }

    return {
      startMs,
      endMs,
      startDate: new Date(startMs).toISOString().split("T")[0]!,
      endDate,
    };
  }
}
