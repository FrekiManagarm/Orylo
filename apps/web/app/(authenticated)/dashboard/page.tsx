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
  const now = new Date();
  const currentDate = [
    now.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
    now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
  ].join(" · ");

  const [stats, recentAnalyses] = await Promise.all([
    getDashboardStats(),
    getFraudAnalyses({ limit: 5 }),
  ]);

  return (
    <div className="space-y-4 relative min-h-screen">
      {/* Background Effects — aligné auth/landing (grid + noise uniquement, halo dans layout) */}
      <div className="absolute inset-0 bg-grid-white opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Overview
          </h1>
          <p className="text-zinc-400 mt-1 font-light">
            Monitor your fraud protection in real-time
          </p>
        </div>
        <div className="flex items-center gap-3">
          <QuickActionsDropdown />
          <RefreshButton />
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest border border-white/10 px-4 py-2 rounded-full bg-zinc-900/50 backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {currentDate}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <Suspense fallback={<div className="text-zinc-500 font-mono text-sm">Chargement…</div>}>
        <StatsGrid stats={stats} />
      </Suspense>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-12">
        {/* Chart Section - Expanded to 8 columns */}
        <Suspense fallback={<div className="h-[350px] rounded-xl border border-white/10 bg-zinc-900/50 animate-pulse" />}>
          <TransactionActivityChart />
        </Suspense>

        {/* Usage & Quick Actions Column - 4 columns */}
        <div className="col-span-12 md:col-span-4 space-y-4">
          {/* Card Testing Widget */}
          <Suspense fallback={<div className="h-40 rounded-xl border border-white/10 bg-zinc-900/50 animate-pulse" />}>
            <CardTestingWidget />
          </Suspense>

          {/* Usage Card */}
          <Suspense fallback={<div className="h-48 rounded-xl border border-white/10 bg-zinc-900/50 animate-pulse" />}>
            <UsageCard />
          </Suspense>
        </div>

      </div>

      {/* Recent Transactions Table — pleine largeur */}
      <div className="w-full">
        <Suspense fallback={<div className="text-zinc-500 font-mono text-sm">Chargement…</div>}>
          <RecentTransactionsTable recentAnalyses={recentAnalyses} />
        </Suspense>
      </div>
    </div>
  );
};

export default DashboardHome;