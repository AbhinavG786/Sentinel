"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Brain, FileText, Clock, AlertTriangle, Shield, ChevronDown,
} from "lucide-react";
import { useIncident, useUpdateIncident, useDeleteIncident } from "@/lib/hooks/useIncidents";
import { useEntityAuditLogs } from "@/lib/hooks/useAuditLogs";
import { usePolicyLogs } from "@/lib/hooks/useAuditLogs";
import { useWebSocket } from "@/lib/hooks/useWebSocket";
import { SeverityBadge } from "@/components/common/SeverityBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfidenceBar } from "@/components/common/ConfidenceBar";
import { PageLoader } from "@/components/common/LoadingSpinner";
import { toast } from "@/components/toaster";
import { formatDate, formatRelativeTime, confidenceColor, formatConfidence } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";
import type { IncidentStatus } from "@/lib/types/incident";

const STATUS_OPTS: IncidentStatus[] = ["open", "in_progress", "resolved", "closed"];

// Highlight redacted tokens in log snippets
function highlightRedacted(text: string) {
  const parts = text.split(/(\[REDACTED_[A-Z_]+\])/g);
  return parts.map((part, i) =>
    /^\[REDACTED_/.test(part) ? (
      <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 mx-0.5">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: incident, isLoading } = useIncident(id);
  const { data: auditData } = useEntityAuditLogs(id);
  const { data: policyLogsData } = usePolicyLogs({ incident_id: id });
  const updateIncident = useUpdateIncident(id);
  const deleteIncident = useDeleteIncident();
  const [statusOpen, setStatusOpen] = useState(false);
  const [aiAnimated, setAiAnimated] = useState(false);

  useWebSocket({
    subscriptions: ["incidents"],
    onIncidentAnalyzed: (data) => {
      const d = data as { incidentId?: string };
      if (d.incidentId === id) {
        setAiAnimated(true);
        toast.success("AI Analysis Complete", "The AI analysis for this incident is ready.");
        setTimeout(() => setAiAnimated(false), 2000);
      }
    },
  });

  if (isLoading) return <PageLoader />;
  if (!incident) return (
    <div className="text-center py-20">
      <p className="text-gray-400">Incident not found.</p>
      <Link href="/incidents" className="text-indigo-400 hover:underline text-sm mt-2 inline-block">← Back to incidents</Link>
    </div>
  );

  const handleStatusChange = async (status: IncidentStatus) => {
    try {
      await updateIncident.mutateAsync({ status });
      setStatusOpen(false);
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Permanently delete this incident?")) return;
    try {
      await deleteIncident.mutateAsync(id);
      toast.success("Incident deleted");
      router.push("/incidents");
    } catch {
      toast.error("Failed to delete incident");
    }
  };

  const auditLogs = auditData?.data ?? [];
  const policyLogs = policyLogsData?.data ?? [];
  const allViolations = policyLogs.flatMap((pl) => pl.violations ?? []);

  return (
    <div className="max-w-[1400px] space-y-4">
      {/* Breadcrumb */}
      <Link href="/incidents" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors w-fit">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Incidents
      </Link>

      {/* Header card */}
      <div className="bg-[#111827] border border-[#2D3748] rounded-xl p-5">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white leading-snug">{incident.title}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-500">
              <span>Source: <span className="text-gray-300">{incident.source}</span></span>
              <span>·</span>
              <span>{formatDate(incident.created_at)}</span>
              {incident.traceId && (
                <>
                  <span>·</span>
                  <span className="font-mono text-gray-400">{incident.traceId.slice(0, 16)}…</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <SeverityBadge severity={incident.severity} />

            {/* Status dropdown */}
            <div className="relative">
              <button
                onClick={() => setStatusOpen((o) => !o)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2D3748] text-sm text-gray-300 hover:bg-white/5 transition-all"
              >
                <StatusBadge status={incident.status} />
                <ChevronDown className="w-3 h-3 text-gray-500" />
              </button>
              {statusOpen && (
                <div className="absolute top-full mt-1 right-0 bg-[#1C2333] border border-[#2D3748] rounded-lg shadow-xl z-20 min-w-[140px] py-1 animate-slide-in-top">
                  {STATUS_OPTS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className={cn(
                        "w-full text-left px-3 py-2 text-xs hover:bg-white/5 transition-colors",
                        incident.status === s ? "text-indigo-400" : "text-gray-300"
                      )}
                    >
                      {s.replace("_", " ")}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={handleDelete}
              className="px-3 py-1.5 text-xs rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all">
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          {/* AI Analysis */}
          <div className={cn(
            "bg-[#111827] border rounded-xl p-5 transition-all duration-500",
            incident.ai_summary
              ? aiAnimated ? "border-indigo-500/50 glow-primary" : "border-[#2D3748]"
              : "border-dashed border-[#2D3748]"
          )}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">AI Analysis</h3>
                <p className="text-[10px] text-gray-500">Powered by Gemini 2.5 Flash</p>
              </div>
              {incident.ai_summary && (
                <div className="ml-auto flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", confidenceColor(incident.ai_summary.confidence))} />
                  <span className="text-xs font-mono text-gray-400">
                    {formatConfidence(incident.ai_summary.confidence)}
                  </span>
                </div>
              )}
            </div>

            {incident.ai_summary ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Summary</p>
                  <p className="text-sm text-gray-200 leading-relaxed">{incident.ai_summary.summary}</p>
                </div>
                <div className="bg-orange-500/5 border border-orange-500/15 rounded-lg p-3">
                  <p className="text-xs font-medium text-orange-400 uppercase tracking-wide mb-1.5">Root Cause</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{incident.ai_summary.root_cause}</p>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-lg p-3">
                  <p className="text-xs font-medium text-emerald-400 uppercase tracking-wide mb-1.5">Resolution</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{incident.ai_summary.resolution}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Confidence</p>
                  <ConfidenceBar confidence={incident.ai_summary.confidence} />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 py-4">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <p className="text-sm text-gray-500">Waiting for AI analysis… (updates in real-time)</p>
              </div>
            )}
          </div>

          {/* Log viewer */}
          {incident.sanitized_log && (
            <div className="bg-[#111827] border border-[#2D3748] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-white">Sanitized Log</h3>
              </div>
              <pre className="bg-[#0A0E1A] rounded-lg p-4 text-xs font-mono text-gray-300 overflow-x-auto leading-relaxed whitespace-pre-wrap border border-[#2D3748]">
                {highlightRedacted(incident.sanitized_log)}
              </pre>
            </div>
          )}

          {/* Audit timeline */}
          {auditLogs.length > 0 && (
            <div className="bg-[#111827] border border-[#2D3748] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-white">Audit Timeline</h3>
              </div>
              <div className="relative pl-4">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-[#2D3748]" />
                <div className="space-y-4">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="relative">
                      <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-indigo-500 border-2 border-[#111827]" />
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium">{log.action.replace(/_/g, " ")}</p>
                          {log.user && (
                            <p className="text-xs text-gray-500 mt-0.5">by {log.user.name}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-600 flex-shrink-0">{formatRelativeTime(log.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Metadata */}
          <div className="bg-[#111827] border border-[#2D3748] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Metadata</h3>
            <dl className="space-y-2.5 text-xs">
              {[
                ["ID", <span className="font-mono text-gray-300">{incident.id.slice(0, 12)}…</span>],
                ["Trace ID", incident.traceId ? <span className="font-mono text-gray-300">{incident.traceId.slice(0, 16)}…</span> : "—"],
                ["Team", incident.team ?? "—"],
                ["Assigned to", incident.assigned_to ?? "—"],
                ["Updated", formatRelativeTime(incident.updated_at)],
              ].map(([label, val]) => (
                <div key={String(label)} className="flex justify-between items-start gap-2">
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="text-right">{val as React.ReactNode}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Policy violations */}
          {allViolations.length > 0 && (
            <div className="bg-[#111827] border border-red-500/15 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-semibold text-white">Policy Violations</h3>
                <span className="ml-auto text-xs font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-md">{allViolations.length}</span>
              </div>
              <div className="space-y-2">
                {allViolations.map((v, i) => (
                  <div key={i} className="bg-red-500/5 border border-red-500/10 rounded-lg p-2.5">
                    <p className="text-xs font-semibold text-red-400">{v.policy_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">{v.violation_text}</p>
                    {v.matched_keyword && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-red-500/10 text-red-300 border border-red-500/15 mt-1">
                        keyword: {v.matched_keyword}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No AI yet summary */}
          {!incident.ai_summary && (
            <div className="bg-[#111827] border border-[#2D3748] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <h3 className="text-sm font-semibold text-white">Analysis Pending</h3>
              </div>
              <p className="text-xs text-gray-500">The AI is processing this incident. The analysis card will update automatically when complete.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
