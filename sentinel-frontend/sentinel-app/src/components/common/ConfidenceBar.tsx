import { cn } from "@/lib/utils";
import { confidenceColor, formatConfidence } from "@/lib/utils/formatters";

interface ConfidenceBarProps {
  confidence: number;
  showLabel?: boolean;
  className?: string;
}

export function ConfidenceBar({ confidence, showLabel = true, className }: ConfidenceBarProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", confidenceColor(confidence))}
          style={{ width: `${Math.round(confidence * 100)}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono text-gray-400 w-9 text-right flex-shrink-0">
          {formatConfidence(confidence)}
        </span>
      )}
    </div>
  );
}
