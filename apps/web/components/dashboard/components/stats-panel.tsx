"use client";

import { useEffect, useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/dashboard/components/stat-card";
import {
  Activity,
  ShieldAlert,
  AlertTriangle,
  DollarSign
} from "lucide-react";

/**
 * StatsPanel Component
 * 
 * Story 2.2:
 * - AC1: Display Total Transactions, Blocked, At Risk, Total Saved
 * - AC2: Layout - 1x4 desktop, 2x2 mobile
 * - AC4: Query fraud_detections by date range
 * - AC5: Calculate Total Saved
 * - AC6: Auto-refresh every 30s
 * - AC7: Date range tabs (Today/Week/Month)
 * - AC8: Loading state
 */

type DateRange = "today" | "week" | "month";

interface StatsData {
  totalTransactions: number;
  blocked: number;
  atRisk: number;
  totalSaved: number; // in cents
}

export function StatsPanel() {
  const [stats, setStats] = useState<StatsData>({
    totalTransactions: 0,
    blocked: 0,
    atRisk: 0,
    totalSaved: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>("today");

  // Fetch stats from API (AC4)
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

  // Initial load
  useEffect(() => {
    fetchStats(dateRange);
  }, [dateRange, fetchStats]);

  // AC6: Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats(dateRange);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [dateRange, fetchStats]);

  // Format Total Saved as currency (AC5)
  const formattedTotalSaved = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(stats.totalSaved / 100);

  return (
    <div className="space-y-4">
      {/* AC7: Date range tabs */}
      <Tabs
        value={dateRange}
        onValueChange={(value) => setDateRange(value as DateRange)}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* AC2: Grid layout - 1x4 desktop, 2x2 mobile */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {/* AC1: Total Transactions */}
        <StatCard
          title="Total Transactions"
          value={stats.totalTransactions}
          icon={Activity}
          isLoading={isLoading}
        />

        {/* AC1: Blocked */}
        <StatCard
          title="Blocked"
          value={stats.blocked}
          icon={ShieldAlert}
          isLoading={isLoading}
        />

        {/* AC1: At Risk (REVIEW) */}
        <StatCard
          title="At Risk"
          value={stats.atRisk}
          icon={AlertTriangle}
          isLoading={isLoading}
        />

        {/* AC1: Total Saved (AC5: formatted currency) */}
        <StatCard
          title="Total Saved"
          value={formattedTotalSaved}
          icon={DollarSign}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
