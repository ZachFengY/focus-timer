import type { CreateTimeRecord, TimeRecord } from "@focusflow/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "../client";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const timerKeys = {
  all: ["time-records"] as const,
  lists: () => [...timerKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...timerKeys.lists(), filters] as const,
  detail: (id: string) => [...timerKeys.all, "detail", id] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useTimeRecords(params?: {
  subjectId?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: timerKeys.list(params ?? {}),
    queryFn: () =>
      apiClient
        .get("v1/time-records", {
          searchParams: params as Record<string, string>,
        })
        .json<{ data: TimeRecord[] }>(),
    select: (res) => res.data,
  });
}

export function useCreateTimeRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateTimeRecord) =>
      apiClient
        .post("v1/time-records", { json: body })
        .json<{ data: TimeRecord }>(),
    onSuccess: () => {
      // Invalidate all time-record lists and stats
      void queryClient.invalidateQueries({ queryKey: timerKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: ["stats"] });
      void queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export function useDeleteTimeRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient
        .delete(`v1/time-records/${id}`)
        .json<{ data: { id: string } }>(),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: timerKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: timerKeys.lists() });
    },
  });
}
