"use client";

import { useEffect, useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  ShieldAlert,
  AlertTriangle,
  DollarSign,
} from "lucide-react";

/**
 * DashboardStatsSection - Mix StatsPanel (PRD) + StatsGrid (design)
 *
 * Story 2.2:
 * - AC1: Total Transactions, Blocked, At Risk (REVIEW), Total Saved (€)
 * - AC2: Layout 1x4 desktop, 2x2 mobile
 * - AC4: Query fraud_detections by date range
 * - AC5: Calculate Total Saved
 * - AC6: Auto-refresh every 30s
 * - AC7: Tabs Today / Week / Month
 * - AC8: Loading state
 *
 * Design: Dark cards with backdrop-blur (dashboard-home style)
 */
type DateRange = "today" | "week" | "month";

interface StatsData {
  totalTransactions: number;
  blocked: number;
  atRisk: number;
  totalSaved: number; // cents
}

const STATS_CONFIG = [
  {
    key: "totalTransactions" as const,
    title: "Transactions Analyzed",
    icon: Activity,
  },
  {
    key: "blocked" as const,
    title: "Frauds Blocked",
    icon: ShieldAlert,
    accentClass: "text-red-600 dark:text-rose-400",
  },
  {
    key: "atRisk" as const,
    title: "At Risk (Review)",
    icon: AlertTriangle,
    accentClass: "text-yellow-600 dark:text-amber-400",
  },
  {
    key: "totalSaved" as const,
    title: "Money Saved",
    icon: DollarSign,
    accentClass: "text-green-600 dark:text-emerald-400",
  },
] as const;

export function DashboardStatsSection() {
  const [stats, setStats] = useState<StatsData>({
    totalTransactions: 0,
    blocked: 0,
    atRisk: 0,
    totalSaved: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>("today");

  const fetchStats = useCallback(async (range: DateRange) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/detections/stats?range=${range}`);

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data: StatsData = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(dateRange);
  }, [dateRange, fetchStats]);

  // AC6: Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats(dateRange);
    }, 30000);
    return () => clearInterval(interval);
  }, [dateRange, fetchStats]);

  const formatValue = (key: keyof StatsData, value: number): string => {
    if (key === "totalSaved") {
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
      }).format(value / 100);
    }
    return new Intl.NumberFormat("fr-FR").format(value);
  };

  return (
    <div className="space-y-4">
      {/* AC7: Date range tabs */}
      <Tabs
        value={dateRange}
        onValueChange={(v) => setDateRange(v as DateRange)}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-3 bg-zinc-900/50 border border-white/10">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* AC2: Grid 1x4 desktop, 2x2 mobile */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {STATS_CONFIG.map((stat) => {
          const { key, title, icon: Icon } = stat;
          const accent = "accentClass" in stat ? stat.accentClass : "text-white";
          return (
          <Card
            key={key}
            className="border border-white/10 bg-zinc-900/50 backdrop-blur-xl shadow-2xl hover:border-indigo-500/50 transition-all duration-300 group"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-mono uppercase tracking-widest text-zinc-500 group-hover:text-zinc-400 transition-colors">
                {title}
              </CardTitle>
              <Icon className="h-4 w-4 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div
                  className={`text-2xl font-bold font-mono ${accent}`}
                >
                  {formatValue(key, stats[key])}
                </div>
              )}
            </CardContent>
          </Card>
        );
        })}
      </div>
    </div>
  );
}
