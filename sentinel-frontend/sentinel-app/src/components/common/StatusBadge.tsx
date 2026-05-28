import { cn } from "@/lib/utils";
import { statusBgColor, statusLabel } from "@/lib/utils/formatters";
import type { IncidentStatus } from "@/lib/types/incident";

interface StatusBadgeProps {
  status: IncidentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
        statusBgColor(status),
        className
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
