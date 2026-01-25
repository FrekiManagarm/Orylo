import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { organization } from "@orylo/database";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StripeConnectButton } from "@/components/stripe-connect-button";
import { Suspense } from "react";

/**
 * Settings Page - Stripe Connection
 * 
 * Story 2.13:
 * - AC1: Settings page route `/settings/stripe`
 * - AC2: Display connection status (Connected / Not Connected)
 * - AC3: Display Stripe account ID and connection date if connected
 * - AC4: "Connect Stripe" button using StripeConnectButton
 * - AC5: "Reconnect Stripe" option if connected
 * - AC6: Follow dashboard layout patterns
 * - AC7: Mobile responsive
 * - AC13: Empty state handling
 * - AC14: Loading states
 */

async function StripeConnectionStatus() {
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
          <CardTitle>Stripe Connection</CardTitle>
          <CardDescription>
            No organization found. Please contact support.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Query organization with stripeAccountId
  const org = await db.query.organization.findFirst({
    where: eq(organization.id, organizationId),
  });

  // Get stripeAccountId from direct field or metadata (backward compatibility)
  const stripeAccountId = org?.stripeAccountId ||
    (org?.metadata ? (() => {
      try {
        const metadata = JSON.parse(org.metadata);
        return metadata.stripeAccountId || null;
      } catch {
        return null;
      }
    })() : null);

  const isConnected = !!stripeAccountId;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stripe Connection</CardTitle>
        <CardDescription>
          Manage your Stripe account connection for fraud detection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AC2: Connection Status */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          {isConnected ? (
            <Badge variant="success">
              Connected
            </Badge>
          ) : (
            <Badge variant="warning">
              Not Connected
            </Badge>
          )}
        </div>

        {/* AC3: Account ID and Date if connected */}
        {isConnected && stripeAccountId && org && (
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium">Account ID: </span>
              <span className="text-sm text-muted-foreground font-mono">
                {stripeAccountId.length > 8
                  ? `acct_****${stripeAccountId.slice(-4)}`
                  : stripeAccountId}
              </span>
            </div>
            {org.createdAt && (
              <div>
                <span className="text-sm font-medium">Connected on: </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(org.createdAt).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        )}

        {/* AC13: Empty state */}
        {!isConnected && (
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Connect your Stripe account to start monitoring fraud detections in real-time.
            </p>
          </div>
        )}

        {/* AC4, AC5: Connect/Reconnect Button */}
        <div className="pt-2">
          <StripeConnectButton />
        </div>
      </CardContent>
    </Card>
  );
}

function StripeConnectionStatusSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-10 w-40" />
      </CardContent>
    </Card>
  );
}

export default async function StripeSettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-6 md:py-10">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stripe Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your Stripe account connection and payment integration
          </p>
        </div>

        {/* AC14: Loading state with Suspense */}
        <Suspense fallback={<StripeConnectionStatusSkeleton />}>
          <StripeConnectionStatus />
        </Suspense>
      </div>
    </div>
  );
}
