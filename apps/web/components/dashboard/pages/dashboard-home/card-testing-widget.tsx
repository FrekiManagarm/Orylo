import { ShieldAlert, Lock, AlertTriangle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCardTestingDataByPaymentIntent } from "@/lib/actions/transactions";
import { cn } from "@/lib/utils";

export const CardTestingWidget = async () => {
  let stats;
  try {
    stats = await getCardTestingStats();
  } catch {
    // Return null if stats can't be fetched (e.g., no org)
    return null;
  }

  const hasActivity = stats.totalBlocked > 0 || stats.totalSuspicious > 0;

  return (
    <Card className="bg-zinc-900/50 border border-white/5 backdrop-blur-xl hover:border-indigo-500/30 transition-all duration-300 group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-indigo-400" />
          Card Testing Protection
        </CardTitle>
        <Link href="/dashboard/card-testing">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-zinc-500 hover:text-white"
          >
            View all
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-rose-400" />
              <span className="text-xs text-zinc-500">Blocked (24h)</span>
            </div>
            <p className={cn(
              "text-xl font-semibold",
              stats.last24hBlocked > 0 ? "text-rose-400" : "text-white"
            )}>
              {stats.last24hBlocked}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />
              <span className="text-xs text-zinc-500">Suspicious</span>
            </div>
            <p className={cn(
              "text-xl font-semibold",
              stats.totalSuspicious > 0 ? "text-orange-400" : "text-white"
            )}>
              {stats.totalSuspicious}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-xs text-zinc-500">Total Blocked</span>
            </div>
            <p className="text-xl font-semibold text-white">
              {stats.totalBlocked}
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm",
          hasActivity
            ? "bg-orange-500/5 border-orange-500/20 text-orange-400"
            : "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
        )}>
          <div className={cn(
            "w-2 h-2 rounded-full animate-pulse",
            hasActivity ? "bg-orange-400" : "bg-emerald-400"
          )} />
          {hasActivity
            ? `${stats.totalBlocked} card testing attacks blocked`
            : "No card testing detected"
          }
        </div>
      </CardContent>
    </Card>
  );
};

