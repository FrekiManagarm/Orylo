import {
  Activity,
  ShieldAlert,
  DollarSign,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/lib/actions/transactions";

export const StatsGrid = async ({
  stats,
}: {
  stats: Awaited<ReturnType<typeof getDashboardStats>>;
}) => {
  const formatCurrency = (amountInCents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amountInCents / 100);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  const statsConfig = [
    {
      title: "Transactions Analyzed",
      value: formatNumber(stats.transactionsAnalyzed.value),
      change: stats.transactionsAnalyzed.change,
      trend: stats.transactionsAnalyzed.change >= 0 ? "up" : "down",
      icon: Activity,
      description: "vs last month",
    },
    {
      title: "Frauds Blocked",
      value: formatNumber(stats.fraudsBlocked.value),
      change: stats.fraudsBlocked.change,
      trend: stats.fraudsBlocked.change >= 0 ? "up" : "down",
      icon: ShieldAlert,
      description: "vs last month",
      textColor: "text-red-600",
    },
    {
      title: "Money Saved",
      value: formatCurrency(stats.moneySaved.value),
      change: stats.moneySaved.change,
      trend: stats.moneySaved.change >= 0 ? "up" : "down",
      icon: DollarSign,
      description: "vs last month",
      textColor: "text-green-600",
    },
    {
      title: "Avg Risk Score",
      value: stats.avgRiskScore.value ? stats.avgRiskScore.value.toFixed(2) : "0.00",
      change: stats.avgRiskScore.change,
      trend: stats.avgRiskScore.change <= 0 ? "up" : "down", // Inversé car un score plus bas est meilleur
      icon: Zap,
      description: "vs last month",
    },
  ];

  return (
    <div className="relative z-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsConfig.map((stat, index) => (
        <Card
          key={index}
          className="bg-zinc-900/50 border border-white/5 backdrop-blur-xl hover:border-indigo-500/30 transition-all duration-300 group"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${stat.textColor || "text-white"}`}
            >
              {stat.value}
            </div>
            <div className="flex items-center text-xs text-zinc-500 mt-1">
              {stat.trend === "up" ? (
                <ArrowUpRight className="mr-1 h-4 w-4 text-emerald-500" />
              ) : (
                <ArrowDownRight className="mr-1 h-4 w-4 text-rose-500" />
              )}
              <span
                className={
                  stat.trend === "up" ? "text-emerald-500" : "text-rose-500"
                }
              >
                {stat.change > 0 ? "+" : ""}
                {stat.change}%
              </span>
              <span className="ml-1 opacity-70">{stat.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
