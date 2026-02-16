import { Suspense } from "react";
import { getFraudAnalyses } from "@/lib/actions/transactions";
import { RefreshButton } from "@/components/dashboard/pages/dashboard-home/refresh-button";
import { QuickActionsDropdown } from "@/components/dashboard/pages/dashboard-home/quick-actions-dropdown";
import { StatsSection } from "@/components/dashboard/pages/dashboard-home/stats-section";
import { LiveFeedWidget } from "@/components/dashboard/pages/dashboard-home/live-feed-widget";
import RecentTransactionsTable from "@/components/dashboard/pages/dashboard-home/recent-transactions-table";
import { TransactionActivityChart } from "@/components/dashboard/pages/dashboard-home/transaction-activity-chart";
import { CardTestingWidget } from "@/components/dashboard/pages/dashboard-home/card-testing-widget";
import { UsageCard } from "@/components/dashboard/pages/dashboard-home/usage-card";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const DashboardHome = async () => {
  const now = new Date();
  const currentDate = [
    now.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  ].join(" · ");

  const recentAnalyses = await getFraudAnalyses({ limit: 5 });

  return (
    <div className="space-y-6 relative min-h-screen pb-20">
      {/* Background Effects */}
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
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest border border-white/10 px-4 py-2 rounded-full bg-zinc-900/50 backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {currentDate}
          </div>
        </div>
      </div>

      {/* Stats: PRD 2.2 avec tabs Today/Week/Month (dashboard-home style) */}
      <StatsSection />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Charts, Widgets, Table */}
        <div className="lg:col-span-7 space-y-6">
          <TransactionActivityChart />
        </div>

        {/* Right Column: Feed (PRD 2.1) */}
        <div className="lg:col-span-5 space-y-6 h-full">
          <Suspense
            fallback={
              <div className="text-zinc-500 font-mono text-sm text-center py-10">
                Loading feed...
              </div>
            }
          >
            <LiveFeedWidget />
          </Suspense>
        </div>
      </div>
      <RecentTransactionsTable recentAnalyses={recentAnalyses} />
    </div>
  );
};

export default DashboardHome;
