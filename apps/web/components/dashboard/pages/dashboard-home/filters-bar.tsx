"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

/**
 * FiltersBar - PRD Story 2.3
 * Decision + Date filters, URL state, dashboard-home style
 */
type DatePreset = "all" | "today" | "week" | "month";

export function FiltersBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentDecision = searchParams.get("decision") || "ALL";
  const currentDatePreset = searchParams.get("datePreset") || "all";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL" && value !== "all") params.set(key, value);
    else params.delete(key);
    params.delete("offset");
    router.push(`/dashboard?${params.toString()}`);
  };

  const updateDatePreset = (preset: DatePreset) => {
    const params = new URLSearchParams(searchParams.toString());
    if (preset === "all") {
      params.delete("datePreset");
      params.delete("dateFrom");
      params.delete("dateTo");
    } else {
      params.set("datePreset", preset);
      const now = new Date();
      const dateTo = now.toISOString();
      let dateFrom: string;
      switch (preset) {
        case "today":
          dateFrom = new Date(now.setHours(0, 0, 0, 0)).toISOString();
          break;
        case "week":
          dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case "month":
          dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
          break;
        default:
          dateFrom = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      }
      params.set("dateFrom", dateFrom);
      params.set("dateTo", dateTo);
    }
    params.delete("offset");
    router.push(`/dashboard?${params.toString()}`);
  };

  const resetFilters = () => router.push("/dashboard");
  const hasActiveFilters = currentDecision !== "ALL" || currentDatePreset !== "all";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-zinc-500 font-mono uppercase tracking-wider">
            Decision
          </span>
          <Select value={currentDecision} onValueChange={(v) => updateFilter("decision", v || "")}>
            <SelectTrigger className="w-full sm:w-[140px] min-h-[44px] bg-zinc-900/50 border border-white/10 text-zinc-300 font-mono text-xs">
              <SelectValue>All</SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-zinc-900/95 border border-white/10">
              <SelectItem value="ALL" className="text-zinc-300">All</SelectItem>
              <SelectItem value="BLOCK" className="text-zinc-300">Block</SelectItem>
              <SelectItem value="REVIEW" className="text-zinc-300">Review</SelectItem>
              <SelectItem value="ALLOW" className="text-zinc-300">Allow</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-zinc-500 font-mono uppercase tracking-wider">
            Date
          </span>
          <Select value={currentDatePreset} onValueChange={(v) => updateDatePreset(v as DatePreset)}>
            <SelectTrigger className="w-full sm:w-[140px] min-h-[44px] bg-zinc-900/50 border border-white/10 text-zinc-300 font-mono text-xs">
              <SelectValue>All time</SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-zinc-900/95 border border-white/10">
              <SelectItem value="all" className="text-zinc-300">All time</SelectItem>
              <SelectItem value="today" className="text-zinc-300">Today</SelectItem>
              <SelectItem value="week" className="text-zinc-300">Last 7 days</SelectItem>
              <SelectItem value="month" className="text-zinc-300">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="w-full sm:w-auto min-h-[44px] text-zinc-400 hover:text-white hover:bg-white/5 border border-white/5 rounded-full font-mono text-xs uppercase tracking-wider"
        >
          <X className="mr-2 h-4 w-4" />
          Reset filters
        </Button>
      )}
    </div>
  );
}
