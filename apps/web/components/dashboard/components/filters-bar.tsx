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
 * FiltersBar Component
 * 
 * Story 2.3:
 * - AC1: Decision filter (Select) - All, BLOCK, REVIEW, ALLOW
 * - AC2: Date range filter with presets
 * - AC5: Reset button to clear filters
 * - AC6: URL state management (shareable links)
 * 
 * Story 2.11:
 * - AC6: Tap targets ≥44px on mobile
 * - AC7: Vertical stack on mobile (already implemented)
 */

type DatePreset = "all" | "today" | "week" | "month";

export function FiltersBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current filter values from URL (AC6)
  const currentDecision = searchParams.get("decision") || "ALL";
  const currentDatePreset = searchParams.get("datePreset") || "all";

  // AC6: Update URL with new filter value
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "ALL" && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset offset when filters change
    params.delete("offset");

    router.push(`/dashboard?${params.toString()}`);
  };

  // AC2: Calculate date range from preset
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

    // Reset offset when filters change
    params.delete("offset");

    router.push(`/dashboard?${params.toString()}`);
  };

  // AC5: Reset all filters
  const resetFilters = () => {
    router.push("/dashboard");
  };

  // Check if any filters are active
  const hasActiveFilters =
    currentDecision !== "ALL" || currentDatePreset !== "all";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* AC1: Decision filter - Story 2.11: Full-width on mobile with 44px tap target */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm font-medium text-muted-foreground">
            Decision:
          </span>
          <Select
            value={currentDecision}
            onValueChange={(value) => updateFilter("decision", value || "")}
          >
            <SelectTrigger className="w-full sm:w-[140px] min-h-[44px]">
              <SelectValue>All</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="BLOCK">Block</SelectItem>
              <SelectItem value="REVIEW">Review</SelectItem>
              <SelectItem value="ALLOW">Allow</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* AC2: Date range presets - Story 2.11: Full-width on mobile with 44px tap target */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm font-medium text-muted-foreground">
            Date:
          </span>
          <Select
            value={currentDatePreset}
            onValueChange={(value) => updateDatePreset(value as DatePreset)}
          >
            <SelectTrigger className="w-full sm:w-[140px] min-h-[44px]">
              <SelectValue>All time</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* AC5: Reset button - Story 2.11: Full-width on mobile with 44px tap target */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="w-full sm:w-auto min-h-[44px]"
        >
          <X className="mr-2 h-4 w-4" />
          Reset filters
        </Button>
      )}
    </div>
  );
}
