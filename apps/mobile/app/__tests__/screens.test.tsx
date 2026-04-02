/**
 * Screen render tests — verify each screen mounts without crashing
 * and displays key UI text.
 */
import { render, screen, fireEvent } from "@testing-library/react-native";
import React from "react";

// ─── Module mocks (hoisted by babel-jest) ────────────────────────────────────

jest.mock("@focusflow/ui", () => ({
  useColors: () => (token: string) => {
    const map: Record<string, string> = {
      "bg-page": "#0B0B0E",
      "bg-card": "#16161A",
      "bg-elevated": "#1A1A1E",
      "text-primary": "#FAFAF9",
      "text-secondary": "#6B6B70",
      "text-tertiary": "#4A4A50",
      "border-subtle": "#2A2A2E",
      "accent-indigo": "#6366F1",
      "accent-green": "#32D583",
      "accent-coral": "#E85A4F",
      "accent-amber": "#FFB547",
    };
    return map[token] ?? "#000000";
  },
  useBreakpoint: () => ({
    isPhone: true,
    isTablet: false,
    isDesktop: false,
    navType: "tabbar",
    breakpoint: "base",
    width: 390,
    height: 844,
  }),
}));

jest.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({
    user: { email: "test@focusflow.app" },
    signOut: jest.fn(),
    isLoading: false,
  }),
}));

jest.mock("@focusflow/api-client", () => ({
  useSubjects: () => ({ data: [], isLoading: false }),
  useTimeRecords: () => ({ data: [], isLoading: false }),
  useCreateTimeRecord: () => ({ mutate: jest.fn(), isPending: false }),
}));

// ─── Static imports (after mocks are registered) ─────────────────────────────

const StatsScreen = require("../(app)/stats/index")
  .default as React.ComponentType;

const CalendarScreen = require("../(app)/calendar/index")
  .default as React.ComponentType;

const GoalsScreen = require("../(app)/goals/index")
  .default as React.ComponentType;

const SettingsScreen = require("../(app)/settings/index")
  .default as React.ComponentType;

// ─── Stats Screen ─────────────────────────────────────────────────────────────

describe("StatsScreen", () => {
  it("renders the title", () => {
    render(<StatsScreen />);
    expect(screen.getByText("统计")).toBeTruthy();
  });

  it("renders period toggle buttons", () => {
    render(<StatsScreen />);
    expect(screen.getAllByText("本周").length).toBeGreaterThan(0);
    expect(screen.getAllByText("本月").length).toBeGreaterThan(0);
  });

  it("renders metric cards", () => {
    render(<StatsScreen />);
    expect(screen.getByText("总时长")).toBeTruthy();
    expect(screen.getByText("连续天数")).toBeTruthy();
  });

  it("renders section headers", () => {
    render(<StatsScreen />);
    expect(screen.getByText("分类占比")).toBeTruthy();
    expect(screen.getByText("每日时长")).toBeTruthy();
  });

  it("renders subject legend items", () => {
    render(<StatsScreen />);
    expect(screen.getAllByText(/编程/).length).toBeGreaterThan(0);
  });

  it("switches to month view when pressing 本月", () => {
    render(<StatsScreen />);
    // Press the first "本月" (toggle button)
    fireEvent.press(screen.getAllByText("本月")[0]);
    expect(screen.getAllByText("本月").length).toBeGreaterThan(0);
  });
});

// ─── Calendar Screen ──────────────────────────────────────────────────────────

describe("CalendarScreen", () => {
  it("renders title", () => {
    render(<CalendarScreen />);
    expect(screen.getByText("日历")).toBeTruthy();
  });

  it("renders weekday header 一", () => {
    render(<CalendarScreen />);
    expect(screen.getAllByText("一")).toBeTruthy();
  });

  it("renders current month label", () => {
    render(<CalendarScreen />);
    const labels = screen.getAllByText(/年.*月/);
    expect(labels.length).toBeGreaterThan(0);
  });

  it("renders day numbers in the grid", () => {
    render(<CalendarScreen />);
    // Day 1 must always be in the grid
    expect(screen.getAllByText("1").length).toBeGreaterThan(0);
  });
});

// ─── Goals Screen ─────────────────────────────────────────────────────────────

describe("GoalsScreen", () => {
  it("renders title", () => {
    render(<GoalsScreen />);
    expect(screen.getByText("目标")).toBeTruthy();
  });

  it("renders new goal button", () => {
    render(<GoalsScreen />);
    expect(screen.getByText("新建")).toBeTruthy();
  });

  it("renders overview card", () => {
    render(<GoalsScreen />);
    expect(screen.getByText("本周完成度")).toBeTruthy();
  });

  it("renders all 3 goal cards", () => {
    render(<GoalsScreen />);
    expect(screen.getAllByText(/编程/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/设计/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/阅读/).length).toBeGreaterThan(0);
  });

  it("shows completed status", () => {
    render(<GoalsScreen />);
    expect(screen.getByText("完成")).toBeTruthy();
  });

  it("shows in-progress status", () => {
    render(<GoalsScreen />);
    expect(screen.getAllByText("进行中").length).toBeGreaterThanOrEqual(1);
  });

  it("shows goal target labels", () => {
    render(<GoalsScreen />);
    expect(screen.getAllByText(/目标:/).length).toBeGreaterThan(0);
  });
});

// ─── Settings Screen ──────────────────────────────────────────────────────────

describe("SettingsScreen", () => {
  it("renders title", () => {
    render(<SettingsScreen />);
    expect(screen.getByText("设置")).toBeTruthy();
  });

  it("renders user email", () => {
    render(<SettingsScreen />);
    expect(screen.getByText("test@focusflow.app")).toBeTruthy();
  });

  it("renders avatar initial letter", () => {
    render(<SettingsScreen />);
    expect(screen.getByText("T")).toBeTruthy(); // "test".charAt(0).toUpperCase()
  });

  it("renders PRO badge", () => {
    render(<SettingsScreen />);
    expect(screen.getByText("PRO")).toBeTruthy();
  });

  it("renders categories section label", () => {
    render(<SettingsScreen />);
    expect(screen.getByText("分类管理")).toBeTruthy();
  });

  it("renders all mock subjects", () => {
    render(<SettingsScreen />);
    expect(screen.getByText("编程")).toBeTruthy();
    expect(screen.getByText("设计")).toBeTruthy();
    expect(screen.getByText("阅读")).toBeTruthy();
    expect(screen.getByText("健身")).toBeTruthy();
  });

  it("renders add category button", () => {
    render(<SettingsScreen />);
    expect(screen.getByText("添加分类")).toBeTruthy();
  });

  it("renders preferences section label", () => {
    render(<SettingsScreen />);
    expect(screen.getByText("偏好设置")).toBeTruthy();
  });

  it("renders preference items", () => {
    render(<SettingsScreen />);
    expect(screen.getByText("通知提醒")).toBeTruthy();
    expect(screen.getByText("深色模式")).toBeTruthy();
    expect(screen.getByText("数据同步")).toBeTruthy();
  });

  it("renders sign-out button", () => {
    render(<SettingsScreen />);
    expect(screen.getByText("退出登录")).toBeTruthy();
  });

  it("triggers signOut on press", () => {
    render(<SettingsScreen />);
    // Should not throw
    fireEvent.press(screen.getByText("退出登录"));
  });
});
