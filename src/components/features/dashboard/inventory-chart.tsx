"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "oklch(0.65 0.2 270)",
  "oklch(0.7 0.18 160)",
  "oklch(0.75 0.15 70)",
  "oklch(0.7 0.15 320)",
  "oklch(0.65 0.2 25)",
];

interface InventoryChartProps {
  data?: { name: string; value: number }[];
}

export function InventoryChart({ data }: InventoryChartProps) {
  const displayData = data && data.length > 0
    ? data
    : [{ name: "No data yet", value: 1 }];

  const isEmpty = !data || data.length === 0;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={displayData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={isEmpty ? 0 : 4}
          dataKey="value"
          stroke="none"
        >
          {displayData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={isEmpty ? "oklch(0.25 0.015 260)" : COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        {!isEmpty && (
          <>
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.17 0.015 260)",
                border: "1px solid oklch(0.25 0.015 260)",
                borderRadius: "8px",
                color: "oklch(0.95 0.005 260)",
              }}
              formatter={(value: any) => `${(value as number).toLocaleString()} units`}
            />
            <Legend />
          </>
        )}
      </PieChart>
    </ResponsiveContainer>
  );
}
