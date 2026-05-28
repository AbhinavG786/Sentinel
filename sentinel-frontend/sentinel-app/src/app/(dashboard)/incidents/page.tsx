"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Trash2, Eye, Filter } from "lucide-react";
import { useIncidents, useDeleteIncident, useCreateIncident } from "@/lib/hooks/useIncidents";
import { useWebSocket } from "@/lib/hooks/useWebSocket";
import { SeverityBadge } from "@/components/common/SeverityBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfidenceBar } from "@/components/common/ConfidenceBar";
import { PageLoader } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { toast } from "@/components/toaster";
import { formatRelativeTime, truncate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";
import type { Severity, IncidentStatus, CreateIncidentDto } from "@/lib/types/incident";

const SEVERITY_OPTS: Severity[] = ["critical", "high", "medium", "low"];
const STATUS_OPTS: IncidentStatus[] = ["open", "in_progress", "resolved", "closed"];

export default function IncidentsPage() {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading, refetch } = useIncidents({
    search: search || undefined,
    severity: severity || undefined,
    status: status || undefined,
    page,
    limit: 15,
  });

  const deleteIncident = useDeleteIncident();
  const createIncident = useCreateIncident();

  useWebSocket({
    subscriptions: ["incidents"],
    onIncidentCreated: (d) => {
      const payload = d as { source?: string };
      toast.info("New Incident", `From ${payload.source ?? "unknown"}`);
      refetch();
    },
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("Delete this incident?")) return;
    try {
      await deleteIncident.mutateAsync(id);
      toast.success("Incident deleted");
    } catch {
      toast.error("Failed to delete incident");
    }
  };

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search incidents…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-[#111827] border border-[#2D3748] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50"
          />
        </div>

        {/* Severity filter */}
        <select
          value={severity}
          onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-[#111827] border border-[#2D3748] rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
        >
          <option value="">All severities</option>
          {SEVERITY_OPTS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>

        {/* Status filter */}
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-[#111827] border border-[#2D3748] rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
        >
          <option value="">All statuses</option>
          {STATUS_OPTS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>

        <div className="flex-1" />

        {/* Create button */}
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 gradient-primary rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" /> New Incident
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#2D3748] bg-[#111827] overflow-hidden">
        {isLoading ? (
          <PageLoader />
        ) : !data?.data?.length ? (
          <EmptyState
            icon={Filter}
            title="No incidents found"
            description="Try adjusting your filters or create a new incident."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2D3748]">
                    {["Title", "Source", "Severity", "Status", "AI Confidence", "Created", ""].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C2333]">
                  {data.data.map((incident) => (
                    <tr key={incident.id} className="hover:bg-white/3 transition-colors group animate-slide-in-top">
                      <td className="px-4 py-3">
                        <Link href={`/incidents/${incident.id}`} className="text-white hover:text-indigo-300 transition-colors font-medium">
                          {truncate(incident.title, 45)}
                        </Link>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">{incident.id.slice(0, 8)}…</p>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{incident.source}</td>
                      <td className="px-4 py-3">
                        <SeverityBadge severity={incident.severity} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={incident.status} />
                      </td>
                      <td className="px-4 py-3 w-32">
                        {incident.ai_summary ? (
                          <ConfidenceBar confidence={incident.ai_summary.confidence} />
                        ) : (
                          <span className="text-xs text-gray-600">Pending…</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {formatRelativeTime(incident.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/incidents/${incident.id}`} className="p-1.5 rounded-md text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={(e) => handleDelete(incident.id, e)}
                            className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#2D3748]">
                <p className="text-xs text-gray-500">
                  {data.total} total · Page {data.page} of {data.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-xs rounded-lg border border-[#2D3748] text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                    disabled={page === data.totalPages}
                    className="px-3 py-1.5 text-xs rounded-lg border border-[#2D3748] text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <CreateIncidentModal
          onClose={() => setShowCreate(false)}
          onCreate={async (dto) => {
            try {
              await createIncident.mutateAsync(dto);
              toast.success("Incident created");
              setShowCreate(false);
            } catch {
              toast.error("Failed to create incident");
            }
          }}
        />
      )}
    </div>
  );
}

function CreateIncidentModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (dto: CreateIncidentDto) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [severity, setSeverity] = useState<Severity>("medium");
  const [log, setLog] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !source) return;
    setLoading(true);
    await onCreate({ title, source, severity, sanitized_log: log || undefined });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#111827] border border-[#2D3748] rounded-2xl w-full max-w-lg p-6 animate-slide-in-top">
        <h3 className="text-lg font-semibold text-white mb-5">Create Incident</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 placeholder-gray-600"
              placeholder="Brief incident title" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Source *</label>
            <input value={source} onChange={(e) => setSource(e.target.value)} required
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 placeholder-gray-600"
              placeholder="e.g. api-gateway, firewall" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Severity</label>
            <select value={severity} onChange={(e) => setSeverity(e.target.value as Severity)}
              className="w-full px-3 py-2 bg-[#1C2333] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
              {SEVERITY_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Log snippet (optional)</label>
            <textarea value={log} onChange={(e) => setLog(e.target.value)} rows={3}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none placeholder-gray-600"
              placeholder="Paste a log snippet…" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-[#2D3748] text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className={cn("flex-1 py-2 rounded-lg text-sm font-semibold text-white gradient-primary hover:opacity-90 transition-all disabled:opacity-60")}>
              {loading ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
