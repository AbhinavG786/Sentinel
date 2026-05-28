import type { Severity, IncidentStatus } from "../types/incident";

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

export function severityColor(severity: Severity): string {
  const map: Record<Severity, string> = {
    critical: "text-red-400",
    high: "text-orange-400",
    medium: "text-yellow-400",
    low: "text-blue-400",
  };
  return map[severity] ?? "text-gray-400";
}

export function severityBgColor(severity: Severity): string {
  const map: Record<Severity, string> = {
    critical: "bg-red-500/10 text-red-400 border-red-500/20",
    high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };
  return map[severity] ?? "bg-gray-500/10 text-gray-400 border-gray-500/20";
}

export function statusBgColor(status: IncidentStatus): string {
  const map: Record<IncidentStatus, string> = {
    open: "bg-red-500/10 text-red-400 border-red-500/20",
    in_progress: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    resolved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    closed: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };
  return map[status] ?? "bg-gray-500/10 text-gray-400";
}

export function statusLabel(status: IncidentStatus): string {
  const map: Record<IncidentStatus, string> = {
    open: "Open",
    in_progress: "In Progress",
    resolved: "Resolved",
    closed: "Closed",
  };
  return map[status] ?? status;
}

export function confidenceColor(confidence: number): string {
  if (confidence >= 0.8) return "bg-emerald-500";
  if (confidence >= 0.6) return "bg-yellow-500";
  return "bg-red-500";
}

export function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max) + "…";
}
