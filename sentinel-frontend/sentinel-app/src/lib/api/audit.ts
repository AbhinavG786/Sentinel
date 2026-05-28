import apiClient from "./client";
import type { AuditLogListResponse, PolicyLogListResponse } from "../types/audit";

export interface AuditFilters {
  entity_type?: string;
  action?: string;
  page?: number;
  limit?: number;
}

export const auditApi = {
  list: (filters: AuditFilters = {}) =>
    apiClient.get<AuditLogListResponse>("/audit-logs", { params: filters }).then((r) => r.data),

  getByEntity: (entityId: string) =>
    apiClient.get<AuditLogListResponse>(`/audit-logs/entity/${entityId}`).then((r) => r.data),

  policyLogs: (filters: { incident_id?: string; page?: number; limit?: number } = {}) =>
    apiClient.get<PolicyLogListResponse>("/policy-logs", { params: filters }).then((r) => r.data),
};
