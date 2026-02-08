import RecentTransactionsTable from "@/components/dashboard/pages/dashboard-home/recent-transactions-table";
import { RefreshButton } from "@/components/dashboard/pages/dashboard-home/refresh-button";
import { QuickActionsDropdown } from "@/components/dashboard/pages/dashboard-home/quick-actions-dropdown";
import { StatsGrid } from "@/components/dashboard/pages/dashboard-home/stats-grid";
import { TransactionActivityChart } from "@/components/dashboard/pages/dashboard-home/transaction-activity-chart";
import { CardTestingWidget } from "@/components/dashboard/pages/dashboard-home/card-testing-widget";
import { UsageCard } from "@/components/dashboard/pages/dashboard-home/usage-card";
import {
  getDashboardStats,
  getFraudAnalyses,
} from "@/lib/actions/transactions";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";


const DashboardHome = async () => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });

  const [stats, recentAnalyses] = await Promise.all([
    getDashboardStats(),
    getFraudAnalyses({ limit: 5 }),
  ]);

  return (
    <div className="bg-black space-y-4 relative overflow-hidden min-h-screen p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-900/0 to-zinc-900/0 pointer-events-none" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] -translate-y-1/2 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Overview
          </h1>
          <p className="text-zinc-400 mt-1">
            Monitor your fraud protection in real-time
          </p>
        </div>
        <div className="flex items-center gap-3">
          <QuickActionsDropdown />
          <RefreshButton />
          <div className="flex items-center gap-2 text-sm text-zinc-400 border border-white/10 px-4 py-2 rounded-full bg-zinc-900/50 backdrop-blur-sm shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {currentDate}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <Suspense fallback={<div>Loading...</div>}>
        <StatsGrid stats={stats} />
      </Suspense>

      {/* Main Content Grid */}
      <div className="relative z-10 grid gap-4 md:grid-cols-12">
        {/* Chart Section - Expanded to 8 columns */}
        <Suspense fallback={<div>Loading...</div>}>
          <TransactionActivityChart />
        </Suspense>

        {/* Usage & Quick Actions Column - 4 columns */}
        <div className="col-span-12 md:col-span-4 space-y-4">
          {/* Card Testing Widget */}
          <Suspense fallback={<div className="h-40 bg-zinc-900/50 rounded-lg animate-pulse" />}>
            <CardTestingWidget />
          </Suspense>

          {/* Usage Card */}
          <Suspense fallback={<div>Loading...</div>}>
            <UsageCard />
          </Suspense>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <Suspense fallback={<div>Loading...</div>}>
        <RecentTransactionsTable recentAnalyses={recentAnalyses} />
      </Suspense>
    </div>
  );
};

export default DashboardHome;