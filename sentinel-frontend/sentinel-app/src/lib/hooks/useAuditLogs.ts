import { useQuery } from "@tanstack/react-query";
import { auditApi, type AuditFilters } from "../api/audit";

export function useAuditLogs(filters: AuditFilters = {}) {
  return useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: () => auditApi.list(filters),
    staleTime: 20_000,
  });
}

export function useEntityAuditLogs(entityId: string) {
  return useQuery({
    queryKey: ["audit-logs", "entity", entityId],
    queryFn: () => auditApi.getByEntity(entityId),
    enabled: !!entityId,
  });
}

export function usePolicyLogs(filters: { incident_id?: string; page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ["policy-logs", filters],
    queryFn: () => auditApi.policyLogs(filters),
    staleTime: 20_000,
  });
}
