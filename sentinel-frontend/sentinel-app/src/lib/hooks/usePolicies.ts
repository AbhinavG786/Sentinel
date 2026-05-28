import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { policiesApi } from "../api/policies";
import type { CreatePolicyDto, UpdatePolicyDto } from "../types/policy";

export function usePolicies() {
  return useQuery({
    queryKey: ["policies"],
    queryFn: policiesApi.list,
    staleTime: 30_000,
  });
}

export function useCreatePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePolicyDto) => policiesApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["policies"] }),
  });
}

export function useUpdatePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePolicyDto }) => policiesApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["policies"] }),
  });
}

export function useDeletePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => policiesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["policies"] }),
  });
}
