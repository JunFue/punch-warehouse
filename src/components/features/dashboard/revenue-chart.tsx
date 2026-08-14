"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const data = [
  { month: "Jan", revenue: 0, expenses: 0 },
  { month: "Feb", revenue: 0, expenses: 0 },
  { month: "Mar", revenue: 0, expenses: 0 },
  { month: "Apr", revenue: 0, expenses: 0 },
  { month: "May", revenue: 0, expenses: 0 },
  { month: "Jun", revenue: 0, expenses: 0 },
];

interface RevenueChartProps {
  data?: { month: string; revenue: number; expenses: number }[];
}

export function RevenueChart({ data: chartData }: RevenueChartProps) {
  const displayData = chartData && chartData.length > 0 ? chartData : data;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={displayData} barGap={4}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="oklch(0.25 0.015 260)"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          stroke="oklch(0.5 0.01 260)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="oklch(0.5 0.01 260)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "oklch(0.17 0.015 260)",
            border: "1px solid oklch(0.25 0.015 260)",
            borderRadius: "8px",
            color: "oklch(0.95 0.005 260)",
          }}
          formatter={(value: any) =>
            `₱${(value as number).toLocaleString("en-PH", {
              minimumFractionDigits: 2,
            })}`
          }
        />
        <Legend />
        <Bar
          dataKey="revenue"
          name="Revenue"
          fill="oklch(0.7 0.18 160)"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="expenses"
          name="Expenses"
          fill="oklch(0.65 0.2 25)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
