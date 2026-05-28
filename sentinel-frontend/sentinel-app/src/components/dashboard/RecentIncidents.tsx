"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { Incident } from "@/lib/types/incident";
import { SeverityBadge } from "@/components/common/SeverityBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatRelativeTime, truncate } from "@/lib/utils/formatters";
import { EmptyState } from "@/components/common/EmptyState";
import { AlertTriangle } from "lucide-react";

interface RecentIncidentsProps {
  incidents: Incident[];
}

export function RecentIncidents({ incidents }: RecentIncidentsProps) {
  return (
    <div className="rounded-xl border border-[#2D3748] bg-[#111827] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Recent Incidents</h3>
          <p className="text-xs text-gray-500 mt-0.5">Live-updating</p>
        </div>
        <Link
          href="/incidents"
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          View all <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {incidents.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="No incidents yet" description="Incidents will appear here as they are detected." />
      ) : (
        <div className="space-y-1">
          {incidents.map((incident) => (
            <Link
              key={incident.id}
              href={`/incidents/${incident.id}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate group-hover:text-indigo-300 transition-colors">
                  {truncate(incident.title, 55)}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {incident.source} &bull; {formatRelativeTime(incident.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <SeverityBadge severity={incident.severity} />
                <StatusBadge status={incident.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
