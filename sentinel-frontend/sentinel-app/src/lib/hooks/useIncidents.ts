import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { incidentsApi, type IncidentFilters } from "../api/incidents";
import type { CreateIncidentDto, UpdateIncidentDto } from "../types/incident";

export function useIncidents(filters: IncidentFilters = {}) {
  return useQuery({
    queryKey: ["incidents", filters],
    queryFn: () => incidentsApi.list(filters),
    staleTime: 15_000,
  });
}

export function useIncident(id: string) {
  return useQuery({
    queryKey: ["incidents", id],
    queryFn: () => incidentsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateIncidentDto) => incidentsApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["incidents"] }),
  });
}

export function useUpdateIncident(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateIncidentDto) => incidentsApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["incidents", id] });
      qc.invalidateQueries({ queryKey: ["incidents"] });
    },
  });
}

export function useDeleteIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => incidentsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["incidents"] }),
  });
}
