"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { TrendPoint } from "@/lib/types/stats";

interface TrendChartProps {
  data: TrendPoint[];
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(dateStr));
}

export function TrendChart({ data }: TrendChartProps) {
  return (
    <div className="rounded-xl border border-[#2D3748] bg-[#111827] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Incident Trend</h3>
          <p className="text-xs text-gray-500 mt-0.5">Last 7 days</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="incidentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fill: "#6B7280", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#6B7280", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1C2333",
              border: "1px solid #2D3748",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#F9FAFB",
            }}
            labelFormatter={(label) => formatDate(String(label))}
            formatter={(v) => [v as number, "Incidents"]}
            cursor={{ stroke: "#6366F1", strokeWidth: 1, strokeDasharray: "4 4" }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#6366F1"
            strokeWidth={2}
            fill="url(#incidentGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "#6366F1", stroke: "#0A0E1A", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
