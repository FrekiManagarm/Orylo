import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { paymentProcessorsConnections } from "@orylo/database";
import { and, eq } from "drizzle-orm";
import { ConnectStripeClient } from "./connect-stripe-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ConnectStripePage() {
  const org = await auth.api.getFullOrganization({
    headers: await headers(),
  });

  let stripeAccountId: string | null = null;
  if (org?.id) {
    const connection = await db.query.paymentProcessorsConnections.findFirst({
      where: and(
        eq(paymentProcessorsConnections.organizationId, org.id),
        eq(paymentProcessorsConnections.paymentProcessor, "stripe"),
        eq(paymentProcessorsConnections.isActive, true),
      ),
      columns: { accountId: true },
    });
    stripeAccountId = connection?.accountId ?? null;
  }

  const stripeConnected = Boolean(stripeAccountId);

  return (
    <div className="space-y-6 relative min-h-screen pb-20">
      <div className="absolute inset-0 bg-grid-white opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Connect Stripe
        </h1>
        <p className="text-zinc-400 mt-1 font-light">
          Link your Stripe account to enable real-time fraud detection on your payments.
        </p>
      </div>

      <ConnectStripeClient
        stripeConnected={stripeConnected}
        stripeAccountId={stripeAccountId}
      />
    </div>
  );
}
