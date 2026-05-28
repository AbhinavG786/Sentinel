"use client";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { Stats } from "@/lib/types/stats";

interface SeverityChartProps {
  severity: Stats["severity"];
}

const COLORS = {
  Critical: "#EF4444",
  High: "#F97316",
  Medium: "#EAB308",
  Low: "#60A5FA",
};

export function SeverityChart({ severity }: SeverityChartProps) {
  const data = [
    { name: "Critical", value: severity.critical },
    { name: "High", value: severity.high },
    { name: "Medium", value: severity.medium },
    { name: "Low", value: severity.low },
  ].filter((d) => d.value > 0);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="rounded-xl border border-[#2D3748] bg-[#111827] p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">Severity Breakdown</h3>
        <p className="text-xs text-gray-500 mt-0.5">{total} total incidents</p>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={COLORS[entry.name as keyof typeof COLORS]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#1C2333",
              border: "1px solid #2D3748",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#F9FAFB",
            }}
            formatter={(v) => [v as number, "incidents"]}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
            formatter={(value) => (
              <span style={{ color: "#9CA3AF" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
