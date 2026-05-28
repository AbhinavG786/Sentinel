import { cn } from "@/lib/utils";
import { severityBgColor } from "@/lib/utils/formatters";
import type { Severity } from "@/lib/types/incident";

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

const labels: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
        severityBgColor(severity),
        className
      )}
    >
      {severity === "critical" && (
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5 animate-pulse" />
      )}
      {labels[severity]}
    </span>
  );
}
