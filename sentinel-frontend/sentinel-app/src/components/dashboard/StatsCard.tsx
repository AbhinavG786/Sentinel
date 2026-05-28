"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  suffix?: string;
  prefix?: string;
  color?: "default" | "danger" | "warning" | "success" | "primary";
  glow?: boolean;
  description?: string;
  isPercentage?: boolean;
}

const colorMap = {
  default: { icon: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/10" },
  danger:  { icon: "text-red-400",  bg: "bg-red-500/10",  border: "border-red-500/15"  },
  warning: { icon: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/15" },
  success: { icon: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/15" },
  primary: { icon: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/15" },
};

function useCountUp(target: number, duration = 800) {
  const [count, setCount] = useState(0);
  const frame = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * ease));
      if (progress < 1) frame.current = requestAnimationFrame(animate);
    };
    frame.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);

  return count;
}

export function StatsCard({
  title, value, icon: Icon, suffix, prefix, color = "default", glow, description, isPercentage,
}: StatsCardProps) {
  const displayValue = useCountUp(isPercentage ? Math.round(value * 100) : value);
  const colors = colorMap[color];

  return (
    <div
      className={cn(
        "rounded-xl border p-5 bg-[#111827] transition-all duration-200 hover:bg-[#1C2333]",
        colors.border,
        glow && color === "danger" && "glow-danger",
        glow && color === "primary" && "glow-primary"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white animate-count-up">
            {prefix}{displayValue.toLocaleString()}{isPercentage ? "%" : ""}{suffix}
          </p>
          {description && (
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          )}
        </div>
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", colors.bg)}>
          <Icon className={cn("w-5 h-5", colors.icon)} />
        </div>
      </div>
    </div>
  );
}
