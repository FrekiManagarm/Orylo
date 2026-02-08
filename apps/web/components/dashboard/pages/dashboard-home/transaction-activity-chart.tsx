"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { day: "Mon", total: 120, blocked: 5, review: 15 },
  { day: "Tue", total: 145, blocked: 8, review: 12 },
  { day: "Wed", total: 132, blocked: 4, review: 18 },
  { day: "Thu", total: 198, blocked: 12, review: 25 },
  { day: "Fri", total: 210, blocked: 15, review: 22 },
  { day: "Sat", total: 160, blocked: 9, review: 10 },
  { day: "Sun", total: 180, blocked: 7, review: 14 },
];

const chartConfig = {
  total: {
    label: "Total",
    color: "#818cf8",
  },
  blocked: {
    label: "Blocked",
    color: "#f43f5e",
  },
  review: {
    label: "Review",
    color: "#f97316",
  },
} satisfies ChartConfig;

export function TransactionActivityChart() {
  return (
    <Card className="col-span-12 md:col-span-8 bg-zinc-900/50 border-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-white">Transaction Activity</CardTitle>
          <CardDescription className="text-zinc-400">
            Analysis of traffic and threat detection
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pl-0">
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-total)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-total)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="fillBlocked" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-blocked)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-blocked)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="fillReview" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-review)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-review)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) => value.slice(0, 3)}
              stroke="#52525b"
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              stroke="#52525b"
              fontSize={12}
            />
            <ChartTooltip
              cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }}
              content={
                <ChartTooltipContent
                  className="bg-zinc-900 border-white/10 text-white shadow-xl"
                  indicator="dot"
                />
              }
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="var(--color-total)"
              fill="url(#fillTotal)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="blocked"
              stroke="var(--color-blocked)"
              fill="url(#fillBlocked)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="review"
              stroke="var(--color-review)"
              fill="url(#fillReview)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
