import type { CreateSubject, Subject, UpdateSubject } from "@focusflow/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "../client";

export const subjectKeys = {
  all: ["subjects"] as const,
  lists: () => [...subjectKeys.all, "list"] as const,
  detail: (id: string) => [...subjectKeys.all, "detail", id] as const,
};

export function useSubjects() {
  return useQuery({
    queryKey: subjectKeys.lists(),
    queryFn: () => apiClient.get("v1/subjects").json<{ data: Subject[] }>(),
    select: (res) => res.data,
    staleTime: 1000 * 60 * 30, // subjects rarely change
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSubject) =>
      apiClient.post("v1/subjects", { json: body }).json<{ data: Subject }>(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: subjectKeys.lists() });
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateSubject & { id: string }) =>
      apiClient
        .patch(`v1/subjects/${id}`, { json: body })
        .json<{ data: Subject }>(),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: subjectKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: subjectKeys.detail(id) });
    },
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`v1/subjects/${id}`).json<{ data: { id: string } }>(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: subjectKeys.lists() });
    },
  });
}
