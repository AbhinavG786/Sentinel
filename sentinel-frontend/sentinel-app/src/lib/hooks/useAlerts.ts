import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alertsApi, type AlertFilters } from "../api/alerts";

export function useAlerts(filters: AlertFilters = {}) {
  return useQuery({
    queryKey: ["alerts", filters],
    queryFn: () => alertsApi.list(filters),
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => alertsApi.acknowledge(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["alerts"] });
      const previous = qc.getQueriesData({ queryKey: ["alerts"] });
      qc.setQueriesData({ queryKey: ["alerts"] }, (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        const data = old as { data: Array<{ id: string; acknowledged: boolean }> };
        return {
          ...data,
          data: data.data.map((a) => a.id === id ? { ...a, acknowledged: true } : a),
        };
      });
      return { previous };
    },
    onError: (_e, _id, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, val]) => qc.setQueryData(key, val));
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });
}
