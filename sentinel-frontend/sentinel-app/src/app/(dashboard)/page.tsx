"use client";

import {
  AlertTriangle, Activity, Shield, Bell, Brain,
} from "lucide-react";
import { useStats } from "@/lib/hooks/useStats";
import { useIncidents } from "@/lib/hooks/useIncidents";
import { useAlerts } from "@/lib/hooks/useAlerts";
import { useWebSocket } from "@/lib/hooks/useWebSocket";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { SeverityChart } from "@/components/dashboard/SeverityChart";
import { RecentIncidents } from "@/components/dashboard/RecentIncidents";
import { PageLoader } from "@/components/common/LoadingSpinner";
import { toast } from "@/components/toaster";
import Link from "next/link";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: incidentsData } = useIncidents({ limit: 10 });
  const { data: alertsData } = useAlerts({ acknowledged: false });

  useWebSocket({
    subscriptions: ["incidents", "alerts", "policies"],
    onIncidentCreated: (data) => {
      const d = data as { source?: string; severity?: string };
      toast.warning("New Incident Detected", `Source: ${d.source ?? "unknown"} · Severity: ${d.severity ?? "?"}`);
    },
    onAlertCreated: (data) => {
      const d = data as { message?: string; severity?: string };
      toast.error("Alert Created", d.message ?? "A new alert was fired");
    },
    onPolicyViolation: (data) => {
      const d = data as { violations?: Array<{ policy_name?: string }> };
      const name = d.violations?.[0]?.policy_name;
      toast.warning("Policy Violation", name ? `Policy: ${name}` : "A policy was violated");
    },
  });

  if (statsLoading) return <PageLoader />;

  const unacknowledgedAlerts = alertsData?.data?.filter((a) => !a.acknowledged) ?? [];

  return (
    <div className="space-y-6 max-w-[1400px]">

      {/* Active alerts banner */}
      {unacknowledgedAlerts.length > 0 && (
        <div className="flex items-center justify-between gap-4 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3 animate-slide-in-top">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 block" />
              <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-50" />
            </div>
            <p className="text-sm font-medium text-red-300">
              {unacknowledgedAlerts.length} unacknowledged alert{unacknowledgedAlerts.length !== 1 ? "s" : ""} require your attention
            </p>
          </div>
          <Link
            href="/alerts"
            className="text-xs font-semibold text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors flex-shrink-0"
          >
            View alerts →
          </Link>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Incidents"
          value={stats?.incidents.total ?? 0}
          icon={Activity}
          color="primary"
        />
        <StatsCard
          title="Open"
          value={stats?.incidents.open ?? 0}
          icon={AlertTriangle}
          color={(stats?.incidents.open ?? 0) > 0 ? "warning" : "default"}
          glow={(stats?.incidents.open ?? 0) > 0}
        />
        <StatsCard
          title="Critical"
          value={stats?.severity.critical ?? 0}
          icon={Shield}
          color={(stats?.severity.critical ?? 0) > 0 ? "danger" : "default"}
          glow={(stats?.severity.critical ?? 0) > 0}
        />
        <StatsCard
          title="Unacked Alerts"
          value={stats?.alerts.unacknowledged ?? 0}
          icon={Bell}
          color={(stats?.alerts.unacknowledged ?? 0) > 0 ? "danger" : "default"}
        />
        <StatsCard
          title="Avg AI Confidence"
          value={stats?.ai.avgConfidence ?? 0}
          icon={Brain}
          color="success"
          isPercentage
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TrendChart data={stats?.recentTrend ?? []} />
        </div>
        <SeverityChart severity={stats?.severity ?? { critical: 0, high: 0, medium: 0, low: 0 }} />
      </div>

      {/* Recent incidents */}
      <RecentIncidents incidents={incidentsData?.data ?? []} />
    </div>
  );
}
