import { Suspense } from "react";
import { getDashboardStats } from "@/lib/actions/transactions";
import { StatsGrid } from "@/components/dashboard/pages/dashboard-home/stats-grid";
import { RefreshButton } from "@/components/dashboard/pages/dashboard-home/refresh-button";
import { QuickActionsDropdown } from "@/components/dashboard/pages/dashboard-home/quick-actions-dropdown";
import { FiltersBar } from "@/components/dashboard/components/filters-bar";
import { FeedClient } from "./feed-client";

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

  const stats = await getDashboardStats();

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

      {/* Stats Grid */}
      <Suspense
        fallback={
          <div className="text-zinc-500 font-mono text-sm">Chargement…</div>
        }
      >
        <StatsGrid stats={stats} />
      </Suspense>

      {/* Main Content: Feed */}
      <div className="mx-auto space-y-6">
        {/* Filters */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl py-4 -mx-4 px-4 md:mx-0 md:px-0 border-b border-white/5 md:border-none md:bg-transparent md:backdrop-blur-none">
          <FiltersBar />
        </div>

        {/* Feed */}
        <Suspense
          fallback={
            <div className="text-zinc-500 font-mono text-sm text-center py-10">
              Loading feed...
            </div>
          }
        >
          <FeedClient />
        </Suspense>
      </div>
    </div>
  );
};

export default DashboardHome;
