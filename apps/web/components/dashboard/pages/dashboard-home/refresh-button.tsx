"use client";

import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function RefreshButton() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    router.refresh(); // Force re-fetch of Server Components
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <Button
      onClick={handleRefresh}
      variant="ghost"
      size="sm"
      className="gap-2 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5 rounded-full px-3 py-1.5 font-mono text-xs uppercase tracking-wider"
      disabled={isRefreshing}
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      Rafraîchir
    </Button>
  );
}
