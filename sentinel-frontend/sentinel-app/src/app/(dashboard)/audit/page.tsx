"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Shield } from "lucide-react";
import { useAuditLogs, usePolicyLogs } from "@/lib/hooks/useAuditLogs";
import { PageLoader } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";

type Tab = "audit" | "policy";

export default function AuditPage() {
  const [activeTab, setActiveTab] = useState<Tab>("audit");
  const [page, setPage] = useState(1);

  const { data: auditData, isLoading: auditLoading } = useAuditLogs({ page, limit: 20 });
  const { data: policyData, isLoading: policyLoading } = usePolicyLogs({ page, limit: 20 });

  const isLoading = activeTab === "audit" ? auditLoading : policyLoading;

  return (
    <div className="space-y-5 max-w-[1200px]">
      {/* Tabs */}
      <div className="flex gap-1 bg-[#111827] rounded-lg p-1 border border-[#2D3748] w-fit">
        {(["audit", "policy"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPage(1); }}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-all",
              activeTab === tab
                ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20"
                : "text-gray-500 hover:text-gray-300"
            )}
          >
            {tab === "audit" ? "Audit Logs" : "Policy Violations"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <PageLoader />
      ) : activeTab === "audit" ? (
        <>
          {!auditData?.data?.length ? (
            <EmptyState icon={FileText} title="No audit logs" description="System events will be logged here." />
          ) : (
            <div className="rounded-xl border border-[#2D3748] bg-[#111827] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#2D3748]">
                      {["Action", "Entity Type", "Entity ID", "User", "Timestamp"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1C2333]">
                    {auditData.data.map((log) => (
                      <tr key={log.id} className="hover:bg-white/3 transition-colors">
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 font-mono">
                            {log.action.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs capitalize">{log.entity_type}</td>
                        <td className="px-4 py-3">
                          {log.entity_type === "incident" ? (
                            <Link href={`/incidents/${log.entity_id}`}
                              className="text-xs font-mono text-indigo-400 hover:text-indigo-300 transition-colors">
                              {log.entity_id.slice(0, 12)}…
                            </Link>
                          ) : (
                            <span className="text-xs font-mono text-gray-500">{log.entity_id.slice(0, 12)}…</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{log.user?.name ?? "System"}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(log.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(auditData.totalPages ?? 1) > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-[#2D3748]">
                  <p className="text-xs text-gray-500">{auditData.total} total · Page {page} of {auditData.totalPages}</p>
                  <div className="flex gap-2">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                      className="px-3 py-1.5 text-xs rounded-lg border border-[#2D3748] text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                      Previous
                    </button>
                    <button onClick={() => setPage((p) => Math.min(auditData.totalPages, p + 1))} disabled={page === auditData.totalPages}
                      className="px-3 py-1.5 text-xs rounded-lg border border-[#2D3748] text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {!policyData?.data?.length ? (
            <EmptyState icon={Shield} title="No policy violations" description="Policy violations will appear here when the firewall detects breaches." />
          ) : (
            <div className="space-y-3">
              {policyData.data.map((log) => (
                <div key={log.id} className="bg-[#111827] border border-red-500/15 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-mono text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                    {log.incident_id && (
                      <Link href={`/incidents/${log.incident_id}`}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-mono transition-colors">
                        incident #{log.incident_id.slice(0, 8)}
                      </Link>
                    )}
                    {log.traceId && (
                      <span className="text-xs text-gray-600 font-mono">trace: {log.traceId.slice(0, 16)}…</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {log.violations?.map((v, i) => (
                      <div key={i} className="bg-red-500/5 border border-red-500/15 rounded-lg px-3 py-2">
                        <p className="text-xs font-semibold text-red-400">{v.policy_name}</p>
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">{v.violation_text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
