"use client";

import { useEffect, useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  ShieldAlert,
  DollarSign,
  Zap,
} from "lucide-react";

/**
 * StatsSection - PRD Story 2.2
 * Stats with Today/Week/Month tabs, auto-refresh 30s, dashboard-home style
 */
type DateRange = "today" | "week" | "month";

interface StatsData {
  totalTransactions: number;
  blocked: number;
  atRisk: number;
  totalSaved: number;
}

const STATS_CONFIG = [
  { key: "totalTransactions" as const, title: "Transactions Analyzed", icon: Activity },
  { key: "blocked" as const, title: "Frauds Blocked", icon: ShieldAlert, accentClass: "text-rose-400" },
  { key: "atRisk" as const, title: "At Risk (Review)", icon: Zap, accentClass: "text-amber-400" },
  { key: "totalSaved" as const, title: "Money Saved", icon: DollarSign, accentClass: "text-emerald-400" },
] as const;

export function StatsSection() {
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
      const res = await fetch(`/api/detections/stats?range=${range}`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data: StatsData = await res.json();
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

  useEffect(() => {
    const interval = setInterval(() => fetchStats(dateRange), 30000);
    return () => clearInterval(interval);
  }, [dateRange, fetchStats]);

  const formatValue = (key: keyof StatsData, value: number): string => {
    if (key === "totalSaved") {
      return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value / 100);
    }
    return new Intl.NumberFormat("fr-FR").format(value);
  };

  return (
    <div className="space-y-4">
      <Tabs value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
        <TabsList className="grid w-full max-w-md grid-cols-3 bg-zinc-900/50 border border-white/10">
          <TabsTrigger value="today" className="font-mono text-xs uppercase tracking-wider">
            Today
          </TabsTrigger>
          <TabsTrigger value="week" className="font-mono text-xs uppercase tracking-wider">
            Week
          </TabsTrigger>
          <TabsTrigger value="month" className="font-mono text-xs uppercase tracking-wider">
            Month
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                <Skeleton className="h-8 w-20 bg-zinc-800" />
              ) : (
                <div className={`text-2xl font-bold font-mono ${accent}`}>
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
