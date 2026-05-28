import apiClient from "./client";
import type { PolicyListResponse, Policy, CreatePolicyDto, UpdatePolicyDto } from "../types/policy";

export const policiesApi = {
  list: () =>
    apiClient.get<PolicyListResponse>("/firewall/api/policies").then((r) => r.data),

  create: (dto: CreatePolicyDto) =>
    apiClient.post<Policy>("/firewall/api/policies", dto).then((r) => r.data),

  update: (id: string, dto: UpdatePolicyDto) =>
    apiClient.patch<Policy>(`/firewall/api/policies/${id}`, dto).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/firewall/api/policies/${id}`).then((r) => r.data),
};
