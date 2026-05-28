"use client";

import { useState } from "react";
import { CheckCircle, Bell, Filter } from "lucide-react";
import { useAlerts, useAcknowledgeAlert } from "@/lib/hooks/useAlerts";
import { useWebSocket } from "@/lib/hooks/useWebSocket";
import { SeverityBadge } from "@/components/common/SeverityBadge";
import { PageLoader } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { toast } from "@/components/toaster";
import { formatRelativeTime } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function AlertsPage() {
  const [severityFilter, setSeverityFilter] = useState("");
  const [ackFilter, setAckFilter] = useState<"" | "true" | "false">("");
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useAlerts({
    severity: severityFilter || undefined,
    acknowledged: ackFilter === "" ? undefined : ackFilter === "true",
    page,
    limit: 15,
  });

  const acknowledge = useAcknowledgeAlert();

  useWebSocket({
    subscriptions: ["alerts"],
    onAlertCreated: (d) => {
      const payload = d as { message?: string; severity?: string };
      toast.error(`Alert: ${payload.severity?.toUpperCase()}`, payload.message ?? "New alert received");
      refetch();
    },
  });

  const handleAck = async (id: string) => {
    try {
      await acknowledge.mutateAsync(id);
      toast.success("Alert acknowledged");
    } catch {
      toast.error("Failed to acknowledge alert");
    }
  };

  return (
    <div className="space-y-5 max-w-[1000px]">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={severityFilter}
          onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-[#111827] border border-[#2D3748] rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
        >
          <option value="">All severities</option>
          {["critical", "high", "medium", "low"].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>

        <select
          value={ackFilter}
          onChange={(e) => { setAckFilter(e.target.value as "" | "true" | "false"); setPage(1); }}
          className="px-3 py-2 bg-[#111827] border border-[#2D3748] rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
        >
          <option value="">All alerts</option>
          <option value="false">Unacknowledged</option>
          <option value="true">Acknowledged</option>
        </select>

        <div className="ml-auto text-xs text-gray-500">
          {data?.total ?? 0} alerts total
        </div>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : !data?.data?.length ? (
        <EmptyState icon={Filter} title="No alerts found" description="Adjust your filters or wait for new alerts to come in." />
      ) : (
        <>
          <div className="space-y-3">
            {data.data.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "bg-[#111827] border rounded-xl p-4 transition-all duration-300 animate-slide-in-top",
                  alert.acknowledged
                    ? "border-[#2D3748] opacity-60"
                    : "border-red-500/25 hover:border-red-500/40"
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Glow dot for unacknowledged */}
                  {!alert.acknowledged && (
                    <div className="relative mt-1 flex-shrink-0">
                      <span className="w-2 h-2 rounded-full bg-red-500 block" />
                      <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-60" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <SeverityBadge severity={alert.severity} />
                      {alert.incident_id && (
                        <Link href={`/incidents/${alert.incident_id}`}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-mono transition-colors">
                          #{alert.incident_id.slice(0, 8)}
                        </Link>
                      )}
                      <span className="text-xs text-gray-600">{formatRelativeTime(alert.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-200 mt-1.5 leading-relaxed">{alert.message}</p>
                    {alert.traceId && (
                      <p className="text-xs text-gray-600 font-mono mt-1">trace: {alert.traceId.slice(0, 20)}…</p>
                    )}
                  </div>

                  {!alert.acknowledged && (
                    <button
                      onClick={() => handleAck(alert.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/25 text-xs text-emerald-400 hover:bg-emerald-500/10 transition-all flex-shrink-0"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Acknowledge
                    </button>
                  )}
                  {alert.acknowledged && (
                    <span className="flex items-center gap-1 text-xs text-gray-600 flex-shrink-0">
                      <CheckCircle className="w-3.5 h-3.5" /> Acknowledged
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {(data.totalPages ?? 1) > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Page {page} of {data.totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 text-xs rounded-lg border border-[#2D3748] text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  Previous
                </button>
                <button onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}
                  className="px-3 py-1.5 text-xs rounded-lg border border-[#2D3748] text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
