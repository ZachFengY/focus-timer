/**
 * Mock data for UI development — replace with real API hooks when backend is ready.
 */

export const MOCK_SUBJECTS = [
  { id: "s1", name: "编程", color: "#6366F1" },
  { id: "s2", name: "设计", color: "#32D583" },
  { id: "s3", name: "阅读", color: "#E85A4F" },
  { id: "s4", name: "健身", color: "#FFB547" },
];

// ─── Time Records ────────────────────────────────────────────────────────────

const now = Date.now();
const DAY = 86400 * 1000;

export const MOCK_TIME_RECORDS = [
  // Today
  {
    id: "r1",
    subjectId: "s1",
    subjectName: "编程",
    subjectColor: "#6366F1",
    mode: "countup" as const,
    duration: 9000, // 2h 30m
    startTime: now - DAY * 0 - 9 * 3600 * 1000,
    endTime: now - DAY * 0 - 9 * 3600 * 1000 + 9000 * 1000,
  },
  {
    id: "r2",
    subjectId: "s2",
    subjectName: "设计",
    subjectColor: "#32D583",
    mode: "countup" as const,
    duration: 6600, // 1h 50m
    startTime: now - DAY * 0 - 6 * 3600 * 1000,
    endTime: now - DAY * 0 - 6 * 3600 * 1000 + 6600 * 1000,
  },
  // Yesterday
  {
    id: "r3",
    subjectId: "s1",
    subjectName: "编程",
    subjectColor: "#6366F1",
    mode: "countup" as const,
    duration: 10800, // 3h
    startTime: now - DAY - 8 * 3600 * 1000,
    endTime: now - DAY - 8 * 3600 * 1000 + 10800 * 1000,
  },
  {
    id: "r4",
    subjectId: "s3",
    subjectName: "阅读",
    subjectColor: "#E85A4F",
    mode: "countup" as const,
    duration: 3600, // 1h
    startTime: now - DAY - 3 * 3600 * 1000,
    endTime: now - DAY - 3 * 3600 * 1000 + 3600 * 1000,
  },
  // 2 days ago
  {
    id: "r5",
    subjectId: "s1",
    subjectName: "编程",
    subjectColor: "#6366F1",
    mode: "countup" as const,
    duration: 7200, // 2h
    startTime: now - DAY * 2 - 9 * 3600 * 1000,
    endTime: now - DAY * 2 - 9 * 3600 * 1000 + 7200 * 1000,
  },
  {
    id: "r6",
    subjectId: "s2",
    subjectName: "设计",
    subjectColor: "#32D583",
    mode: "countup" as const,
    duration: 5400, // 1h 30m
    startTime: now - DAY * 2 - 5 * 3600 * 1000,
    endTime: now - DAY * 2 - 5 * 3600 * 1000 + 5400 * 1000,
  },
  // 3 days ago
  {
    id: "r7",
    subjectId: "s4",
    subjectName: "健身",
    subjectColor: "#FFB547",
    mode: "countup" as const,
    duration: 3600, // 1h
    startTime: now - DAY * 3 - 7 * 3600 * 1000,
    endTime: now - DAY * 3 - 7 * 3600 * 1000 + 3600 * 1000,
  },
  {
    id: "r8",
    subjectId: "s3",
    subjectName: "阅读",
    subjectColor: "#E85A4F",
    mode: "countup" as const,
    duration: 4800, // 1h 20m
    startTime: now - DAY * 3 - 4 * 3600 * 1000,
    endTime: now - DAY * 3 - 4 * 3600 * 1000 + 4800 * 1000,
  },
  // 4 days ago
  {
    id: "r9",
    subjectId: "s1",
    subjectName: "编程",
    subjectColor: "#6366F1",
    mode: "countup" as const,
    duration: 12600, // 3h 30m
    startTime: now - DAY * 4 - 9 * 3600 * 1000,
    endTime: now - DAY * 4 - 9 * 3600 * 1000 + 12600 * 1000,
  },
  // 5 days ago
  {
    id: "r10",
    subjectId: "s2",
    subjectName: "设计",
    subjectColor: "#32D583",
    mode: "countup" as const,
    duration: 7200, // 2h
    startTime: now - DAY * 5 - 10 * 3600 * 1000,
    endTime: now - DAY * 5 - 10 * 3600 * 1000 + 7200 * 1000,
  },
  // 6 days ago
  {
    id: "r11",
    subjectId: "s1",
    subjectName: "编程",
    subjectColor: "#6366F1",
    mode: "countup" as const,
    duration: 9000, // 2h 30m
    startTime: now - DAY * 6 - 9 * 3600 * 1000,
    endTime: now - DAY * 6 - 9 * 3600 * 1000 + 9000 * 1000,
  },
];

// ─── Stats ───────────────────────────────────────────────────────────────────

export const MOCK_STATS_WEEK = {
  totalSeconds: 67320, // 18h 42m
  streakDays: 7,
  bestStreakDays: 15,
  percentChange: 12,
  // By subject
  subjects: [
    { id: "s1", name: "编程", color: "#6366F1", seconds: 24840, percent: 37 }, // 6h 54m
    { id: "s2", name: "设计", color: "#32D583", seconds: 18120, percent: 27 }, // 5h 02m
    { id: "s3", name: "阅读", color: "#E85A4F", seconds: 12120, percent: 18 }, // 3h 22m
    { id: "s4", name: "健身", color: "#FFB547", seconds: 12240, percent: 18 }, // 3h 24m
  ],
  // Daily breakdown (Mon–Sun), seconds
  dailySeconds: [9000, 14400, 12600, 8400, 9600, 6120, 7200],
};

export const MOCK_STATS_MONTH = {
  totalSeconds: 216000, // 60h
  streakDays: 7,
  bestStreakDays: 15,
  percentChange: 8,
  subjects: [
    { id: "s1", name: "编程", color: "#6366F1", seconds: 86400, percent: 40 },
    { id: "s2", name: "设计", color: "#32D583", seconds: 64800, percent: 30 },
    { id: "s3", name: "阅读", color: "#E85A4F", seconds: 43200, percent: 20 },
    { id: "s4", name: "健身", color: "#FFB547", seconds: 21600, percent: 10 },
  ],
  dailySeconds: [
    10800, 14400, 9000, 7200, 12600, 10800, 9000, 14400, 18000, 12600, 10800,
    7200, 14400, 10800, 9000, 12600, 14400, 10800, 7200, 9000, 12600, 10800,
    14400, 9000, 7200, 12600, 10800, 9000, 14400, 10800,
  ],
};

// ─── Calendar ────────────────────────────────────────────────────────────────

/** Days in current month that have records — date number → array of subject colors */
export const MOCK_CALENDAR_DOTS: Record<number, string[]> = {
  1: ["#6366F1"],
  2: ["#32D583"],
  3: ["#6366F1", "#E85A4F"],
  5: ["#6366F1"],
  7: ["#32D583", "#6366F1"],
  8: ["#6366F1"],
  10: ["#E85A4F", "#FFB547"],
  12: ["#6366F1"],
  13: ["#32D583"],
  14: ["#6366F1", "#32D583"],
  15: ["#E85A4F"],
  17: ["#6366F1"],
  18: ["#6366F1", "#32D583"],
  19: ["#6366F1"],
  20: ["#FFB547"],
  21: ["#6366F1", "#E85A4F"],
  22: ["#32D583"],
  24: ["#6366F1"],
  25: ["#32D583", "#6366F1"],
  26: ["#E85A4F"],
  28: ["#6366F1"],
};

export const MOCK_CALENDAR_SESSIONS: Record<
  string,
  Array<{
    subjectName: string;
    subjectColor: string;
    startLabel: string;
    endLabel: string;
    durationSeconds: number;
  }>
> = {
  "2026-04-01": [
    {
      subjectName: "编程",
      subjectColor: "#6366F1",
      startLabel: "09:00",
      endLabel: "11:30",
      durationSeconds: 9000,
    },
    {
      subjectName: "设计",
      subjectColor: "#32D583",
      startLabel: "14:00",
      endLabel: "15:50",
      durationSeconds: 6600,
    },
  ],
};

// ─── Goals ───────────────────────────────────────────────────────────────────

export const MOCK_GOALS = [
  {
    id: "g1",
    type: "daily" as const,
    label: "每日",
    labelColor: "#6366F1",
    labelBg: "#6366F133",
    title: "编程 · 每天 3 小时",
    currentSeconds: 9900, // 2h 45m
    targetSeconds: 10800, // 3h
    progress: 0.917,
    status: "completed" as const,
    statusLabel: "完成",
    statusColor: "#32D583",
    progressBarColor: "#32D583",
  },
  {
    id: "g2",
    type: "weekly" as const,
    label: "每周",
    labelColor: "#E85A4F",
    labelBg: "#E85A4F33",
    title: "设计 · 每周 10 小时",
    currentSeconds: 22800, // 6h 20m
    targetSeconds: 36000, // 10h
    progress: 0.633,
    status: "inProgress" as const,
    statusLabel: "进行中",
    statusColor: "#FFB547",
    progressBarColor: "#E85A4F",
  },
  {
    id: "g3",
    type: "monthly" as const,
    label: "每月",
    labelColor: "#32D583",
    labelBg: "#32D58333",
    title: "阅读 · 每月 20 小时",
    currentSeconds: 27900, // 7h 45m
    targetSeconds: 72000, // 20h
    progress: 0.388,
    status: "inProgress" as const,
    statusLabel: "进行中",
    statusColor: "#FFB547",
    progressBarColor: "#32D583",
  },
];

export const MOCK_GOALS_OVERVIEW = {
  completedThisWeek: 5,
  totalThisWeek: 7,
  overallProgress: 5 / 7,
  streakDays: 7,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export function formatDurationLong(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  return `${seconds}s`;
}
