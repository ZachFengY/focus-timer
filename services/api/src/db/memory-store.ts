/**
 * In-memory store — zero-dependency local development database.
 * Replaces Supabase for local dev. Data resets on server restart.
 *
 * Structure mirrors the PostgreSQL schema 1:1 so switching to
 * Supabase later only requires swapping the service layer.
 */
import { randomUUID } from "node:crypto";

// ─── Row Types (match DB columns exactly) ─────────────────────────────────────

export interface UserRow {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: number;
}

export interface SubjectRow {
  id: string;
  userId: string;
  name: string;
  color: string | null;
  icon: string | null;
  isDeleted: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface TimeRecordRow {
  id: string;
  userId: string;
  subjectId: string | null;
  mode: "countup" | "countdown";
  duration: number;
  startTime: number;
  endTime: number | null;
  createdAt: number;
}

export interface PauseRecordRow {
  id: string;
  timeRecordId: string;
  startTime: number;
  endTime: number | null;
}

export interface GoalRow {
  id: string;
  userId: string;
  type: "daily" | "weekly" | "monthly" | "subject";
  targetDuration: number;
  subjectId: string | null;
  createdAt: number;
  updatedAt: number;
}

// ─── Store ────────────────────────────────────────────────────────────────────

class MemoryStore {
  readonly users = new Map<string, UserRow>();
  readonly subjects = new Map<string, SubjectRow>();
  readonly timeRecords = new Map<string, TimeRecordRow>();
  readonly pauseRecords = new Map<string, PauseRecordRow>();
  readonly goals = new Map<string, GoalRow>();

  // ── Helpers ────────────────────────────────────────────────────────────────

  newId(): string {
    return randomUUID();
  }

  now(): number {
    return Date.now();
  }

  findOne<T>(map: Map<string, T>, pred: (v: T) => boolean): T | undefined {
    for (const v of map.values()) {
      if (pred(v)) return v;
    }
    return undefined;
  }

  findMany<T>(map: Map<string, T>, pred: (v: T) => boolean): T[] {
    const results: T[] = [];
    for (const v of map.values()) {
      if (pred(v)) results.push(v);
    }
    return results;
  }

  // ── Stats helpers ──────────────────────────────────────────────────────────

  /**
   * Returns records whose startTime (ms) falls in [startMs, endMs].
   */
  recordsInRange(
    userId: string,
    startMs: number,
    endMs: number,
  ): TimeRecordRow[] {
    return this.findMany(
      this.timeRecords,
      (r) =>
        r.userId === userId && r.startTime >= startMs && r.startTime <= endMs,
    );
  }

  /**
   * Calculates consecutive-day streak up to today.
   */
  calcStreak(userId: string): number {
    const days = new Set(
      this.findMany(this.timeRecords, (r) => r.userId === userId).map((r) =>
        new Date(r.startTime).toDateString(),
      ),
    );
    let streak = 0;
    const cursor = new Date();
    while (days.has(cursor.toDateString())) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  /** Wipe everything — useful in tests. */
  clear(): void {
    this.users.clear();
    this.subjects.clear();
    this.timeRecords.clear();
    this.pauseRecords.clear();
    this.goals.clear();
  }
}

export const db = new MemoryStore();
