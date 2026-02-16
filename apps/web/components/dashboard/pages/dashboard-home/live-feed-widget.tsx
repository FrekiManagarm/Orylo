"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FiltersBar } from "./filters-bar";
import { DetectionFeedSection } from "./detection-feed-section";
import { Activity } from "lucide-react";

export function LiveFeedWidget() {
  return (
    <Card className="h-full border border-white/10 bg-zinc-900/50 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col">
      <CardHeader className="border-b border-white/5 bg-white/2 pb-4">
        <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
                <CardTitle className="text-white font-semibold flex items-center gap-2">
                    <Activity className="h-4 w-4 text-indigo-400" />
                    Live Feed
                </CardTitle>
                <CardDescription className="text-zinc-400 font-light">
                    Real-time fraud detection stream
                </CardDescription>
            </div>
        </div>
        <FiltersBar />
      </CardHeader>
      <CardContent className="p-0 flex-1 bg-transparent overflow-y-auto">
         <DetectionFeedSection variant="list" />
      </CardContent>
    </Card>
  );
}
