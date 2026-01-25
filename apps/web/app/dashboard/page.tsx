import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { FeedClient } from "./feed-client";
import { StatsPanel } from "@/components/stats-panel";
import { FiltersBar } from "@/components/filters-bar";
import { MobileNav } from "@/components/mobile-nav";

/**
 * Dashboard Page - Server Component
 * 
 * Story 2.1 - AC1: Vertical feed layout, cards stack, most recent at top
 * Story 2.2 - Stats Panel with key metrics
 * Story 2.3 - Filters for detections feed
 * Story 2.6 - Mobile navigation with sheet
 * 
 * Responsibilities:
 * - Verify authentication
 * - Render MobileNav component (Story 2.6)
 * - Render StatsPanel component (Story 2.2)
 * - Render FiltersBar component (Story 2.3)
 * - Render FeedClient component for client-side interactions
 */
export default async function DashboardPage() {
  // Verify session
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      {/* Story 2.6: Mobile Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
        <div className="container flex h-14 items-center">
          <MobileNav />
          <div className="flex flex-1 items-center justify-center">
            <h2 className="text-lg font-semibold">Orylo</h2>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-6 md:py-10">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">
              Fraud Detections
            </h1>
          </div>
          
          {/* Story 2.2: Stats Panel */}
          <StatsPanel />
          
          {/* Story 2.3: Filters Bar */}
          <FiltersBar />
          
          {/* Story 2.1: Feed Client Component */}
          <FeedClient />
        </div>
      </div>
    </div>
  );
}
