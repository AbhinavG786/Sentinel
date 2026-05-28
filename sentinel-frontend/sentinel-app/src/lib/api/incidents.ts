import apiClient from "./client";
import type { IncidentListResponse, Incident, CreateIncidentDto, UpdateIncidentDto } from "../types/incident";

export interface IncidentFilters {
  status?: string;
  severity?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const incidentsApi = {
  list: (filters: IncidentFilters = {}) =>
    apiClient.get<IncidentListResponse>("/incidents", { params: filters }).then((r) => r.data),

  get: (id: string) =>
    apiClient.get<Incident>(`/incidents/${id}`).then((r) => r.data),

  create: (dto: CreateIncidentDto) =>
    apiClient.post<Incident>("/incidents", dto).then((r) => r.data),

  update: (id: string, dto: UpdateIncidentDto) =>
    apiClient.patch<Incident>(`/incidents/${id}`, dto).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/incidents/${id}`).then((r) => r.data),
};
