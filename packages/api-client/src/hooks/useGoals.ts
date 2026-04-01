import type {
  CreateGoal,
  GoalWithProgress,
  UpdateGoal,
} from "@focusflow/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "../client";

export const goalKeys = {
  all: ["goals"] as const,
  lists: () => [...goalKeys.all, "list"] as const,
};

export function useGoals() {
  return useQuery({
    queryKey: goalKeys.lists(),
    queryFn: () =>
      apiClient.get("v1/goals").json<{ data: GoalWithProgress[] }>(),
    select: (res) => res.data,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateGoal) =>
      apiClient
        .post("v1/goals", { json: body })
        .json<{ data: GoalWithProgress }>(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateGoal & { id: string }) =>
      apiClient
        .patch(`v1/goals/${id}`, { json: body })
        .json<{ data: GoalWithProgress }>(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`v1/goals/${id}`).json<{ data: { id: string } }>(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
}
