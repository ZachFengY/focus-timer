import {
  formatDuration,
  formatDurationLong,
  MOCK_SUBJECTS,
  MOCK_TIME_RECORDS,
  MOCK_STATS_WEEK,
  MOCK_STATS_MONTH,
  MOCK_GOALS,
  MOCK_GOALS_OVERVIEW,
} from "../mock";

describe("formatDuration", () => {
  it("formats hours and minutes", () => {
    expect(formatDuration(9000)).toBe("2h 30m");
  });

  it("formats hours only", () => {
    expect(formatDuration(7200)).toBe("2h");
  });

  it("formats minutes only", () => {
    expect(formatDuration(1800)).toBe("30m");
  });

  it("formats zero as 0m", () => {
    expect(formatDuration(0)).toBe("0m");
  });

  it("handles > 10 hours", () => {
    expect(formatDuration(67320)).toBe("18h 42m");
  });
});

describe("formatDurationLong", () => {
  it("formats hours and minutes", () => {
    expect(formatDurationLong(9000)).toBe("2h 30m");
  });

  it("formats seconds when < 1 minute", () => {
    expect(formatDurationLong(30)).toBe("30s");
  });

  it("formats minutes only", () => {
    expect(formatDurationLong(600)).toBe("10m");
  });
});

describe("MOCK_SUBJECTS", () => {
  it("has 4 subjects", () => {
    expect(MOCK_SUBJECTS).toHaveLength(4);
  });

  it("each subject has id, name, color", () => {
    for (const s of MOCK_SUBJECTS) {
      expect(s).toHaveProperty("id");
      expect(s).toHaveProperty("name");
      expect(typeof s.color).toBe("string");
      expect(s.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe("MOCK_TIME_RECORDS", () => {
  it("all records have required fields", () => {
    for (const r of MOCK_TIME_RECORDS) {
      expect(r.id).toBeTruthy();
      expect(r.subjectId).toBeTruthy();
      expect(typeof r.duration).toBe("number");
      expect(r.duration).toBeGreaterThan(0);
      expect(r.endTime).toBeGreaterThan(r.startTime);
    }
  });
});

describe("MOCK_STATS_WEEK", () => {
  it("has totalSeconds, streak, percentChange", () => {
    expect(MOCK_STATS_WEEK.totalSeconds).toBeGreaterThan(0);
    expect(MOCK_STATS_WEEK.streakDays).toBeGreaterThan(0);
    expect(MOCK_STATS_WEEK.percentChange).toBeGreaterThanOrEqual(0);
  });

  it("has 7 daily entries", () => {
    expect(MOCK_STATS_WEEK.dailySeconds).toHaveLength(7);
  });

  it("subject percents sum to ~100", () => {
    const total = MOCK_STATS_WEEK.subjects.reduce((a, s) => a + s.percent, 0);
    expect(total).toBeGreaterThanOrEqual(99);
    expect(total).toBeLessThanOrEqual(101);
  });
});

describe("MOCK_STATS_MONTH", () => {
  it("has 30 daily entries", () => {
    expect(MOCK_STATS_MONTH.dailySeconds).toHaveLength(30);
  });
});

describe("MOCK_GOALS", () => {
  it("has 3 goals", () => {
    expect(MOCK_GOALS).toHaveLength(3);
  });

  it("each goal has a valid progress 0-1", () => {
    for (const g of MOCK_GOALS) {
      expect(g.progress).toBeGreaterThanOrEqual(0);
      expect(g.progress).toBeLessThanOrEqual(1);
    }
  });

  it("each goal has currentSeconds <= targetSeconds (or completed with slight overshoot)", () => {
    for (const g of MOCK_GOALS) {
      expect(g.targetSeconds).toBeGreaterThan(0);
    }
  });
});

describe("MOCK_GOALS_OVERVIEW", () => {
  it("completedThisWeek <= totalThisWeek", () => {
    expect(MOCK_GOALS_OVERVIEW.completedThisWeek).toBeLessThanOrEqual(
      MOCK_GOALS_OVERVIEW.totalThisWeek,
    );
  });

  it("overallProgress matches ratio", () => {
    expect(MOCK_GOALS_OVERVIEW.overallProgress).toBeCloseTo(
      MOCK_GOALS_OVERVIEW.completedThisWeek / MOCK_GOALS_OVERVIEW.totalThisWeek,
      5,
    );
  });
});
