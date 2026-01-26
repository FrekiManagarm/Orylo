import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RuleRecommendationsList } from "@/components/rule-recommendations-list";
import { AIMetricsCard } from "@/components/ai-metrics-card";
import { PrivacySettingsCard } from "@/components/privacy-settings-card";

/**
 * Settings Page - Custom Rules Recommendations
 * 
 * Story 4.3: AC4 - Display AI rule recommendations
 * 
 * - New Settings page route `/settings/custom-rules` (separate from `/settings/stripe`)
 * - Show recommendation list with accept/reject actions
 * - Show applied rules effectiveness metrics (if any)
 */

async function RecommendationsContent() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  // Get organization ID from session
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const organizationId = (session.user as any).organizationId as string | undefined;

  if (!organizationId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Custom Rules Recommendations</CardTitle>
          <CardDescription>
            No organization found. Please contact support.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      {/* Story 4.4: AI Metrics Card */}
      <AIMetricsCard organizationId={organizationId} />

      {/* Story 4.4: Privacy Settings Card */}
      <PrivacySettingsCard organizationId={organizationId} />

      {/* Story 4.3: Rule Recommendations */}
      <RuleRecommendationsList organizationId={organizationId} />
    </>
  );
}

export default function CustomRulesPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Custom Rules Recommendations</h1>
        <p className="text-muted-foreground">
          Suggestions de règles personnalisées basées sur vos patterns de transaction
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        }
      >
        <RecommendationsContent />
      </Suspense>
    </div>
  );
}
