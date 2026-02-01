import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { FeedClient } from "./feed-client";
import { StatsPanel } from "@/components/dashboard/components/stats-panel";
import { FiltersBar } from "@/components/dashboard/components/filters-bar";

/**
 * Dashboard Page - Server Component
 *
 * Story 2.1 - AC1: Vertical feed layout, cards stack, most recent at top
 * Story 2.2 - Stats Panel with key metrics
 * Story 2.3 - Filters for detections feed
 *
 * Responsibilities:
 * - Verify authentication
 * - Render StatsPanel component (Story 2.2)
 * - Render FiltersBar component (Story 2.3)
 * - Render FeedClient component for client-side interactions
 * 
 * Note: Navigation is handled by AuthenticatedLayout (AppHeader + MobileNav)
 */
export default async function DashboardPage() {
  // Verify session
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  return (
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
  );
}
