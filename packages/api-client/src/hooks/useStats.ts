import type { CalendarDay, StatRange, StatsResponse } from "@focusflow/types";
import { useQuery } from "@tanstack/react-query";

import { apiClient } from "../client";

export const statsKeys = {
  all: ["stats"] as const,
  summary: (range: StatRange) => [...statsKeys.all, "summary", range] as const,
  calendar: (year: number, month: number) =>
    [...statsKeys.all, "calendar", year, month] as const,
};

export function useStats(range: StatRange) {
  return useQuery({
    queryKey: statsKeys.summary(range),
    queryFn: () =>
      apiClient
        .get("v1/stats", { searchParams: { range } })
        .json<{ data: StatsResponse }>(),
    select: (res) => res.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCalendar(year: number, month: number) {
  return useQuery({
    queryKey: statsKeys.calendar(year, month),
    queryFn: () =>
      apiClient
        .get("v1/stats/calendar", { searchParams: { year, month } })
        .json<{ data: CalendarDay[] }>(),
    select: (res) => res.data,
    staleTime: 1000 * 60 * 10,
  });
}
